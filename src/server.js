import pino from 'pino'
import Debug from 'debug'
import Koa from 'koa'
import Boom from 'boom'
// import ratelimit from 'koa-ratelimit'
// import Redis from 'ioredis'
// import session from 'koa-session'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
// import Csrf from 'koa-csrf'
// import jwt from 'jsonwebtoken'
// import koaJwt from 'koa-jwt'
import cors from '@koa/cors'

import { validateEndpointDonation } from '@/validators'
import {
  endpointStripe,
  endpointStripeExecute,
  endpointStripeWebhook,
} from './endpoints/stripe'
import {
  endpointPaypal,
  endpointPaypalExecutePayment,
  endpointPaypalExecuteAgreement,
} from './endpoints/paypal'

const port = process.env.PORT || 3000
const { ENDPOINT_CORS_ORIGIN } = process.env
const debug = Debug(`server`)
const logger = pino({ name: `server` })
// const redis = new Redis()
const app = new Koa()
const router = new Router()

const SECRET = `@!-_-THE_-_SECRET-_-!@`
const isProduction = process.env.NODE_ENV === `production`

// router.use(auth())

app.keys = [SECRET, `SECRET!`]

process.on(`SIGTERM`, async () => {
  logger.info(`Starting graceful shutdown`)
  let exitCode = 0

  try {
    await app.closeServer()
    // .then(closeMysqlConnection())
  } catch (error) {
    exitCode = 1
    logger.error(`Error in graceful shutdown `, error)
  }

  logger.info(`gacefully stopped`)
  process.exit(exitCode)
})

// error handler
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = { msg: `error` }
    ctx.app.emit(`error`, err, ctx)
    debug(err.message)
  }
})

// Custom 401 handling if you don't want to expose koa-jwt errors to users
// app.use(function(ctx, next) {
//   return next().catch(
//     err => new Boom.unauthorized(`invalid token`)
//     // if (401 == err.status) {
//     //   ctx.status = 401
//     //   ctx.body = `Protected resource, use Authorization header to get access\n`
//     // } else {
//     //   throw err
//     // }
//   )
// })

// Document error and 404 handling
// app.use(async (ctx, next) => {
//   try {
//     await next();
//   } catch (err) {
//     if (err) {
//       ctx.status = err.status;
//       ctx.body = Boom.wrap(err, err.status, err.message).output.payload; // can be replaced with `ctx.body = err.message`
//       app.emit('error', err, ctx);
//       return;
//     }
//     // 404 handler
//     ctx.status = 404;
//     ctx.body = Boom.notFound().output.payload; // can be replaced with `ctx.body = "Not Found"`
//   }
// })

app.use(
  cors({
    origin: isProduction ? ENDPOINT_CORS_ORIGIN : `*`,
  })
)

router.post(`webhooks/stripe`, endpointStripeWebhook)

// app.use(
//   new Csrf({
//     invalidSessionSecretMessage: `Invalid session secret`,
//     invalidSessionSecretStatusCode: 403,
//     invalidTokenMessage: `Invalid CSRF token`,
//     invalidTokenStatusCode: 403,
//     excludedMethods: [`GET`, `HEAD`, `OPTIONS`],
//     disableQuery: false,
//   })
// )

// app.use(
//   koaJwt({
//     secret: SECRET,
//   })
// )

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set(`X-Response-Time`, `${ms}ms`)
})

// https://github.com/koajs/ratelimit
// app.use(
//   ratelimit({
//     // db: redis,
//     duration: 60000,
//     errorMessage: `Sometimes You Just Have to Slow Down.`,
//     id: ctx => ctx.ip,
//     headers: {
//       remaining: `Rate-Limit-Remaining`,
//       reset: `Rate-Limit-Reset`,
//       total: `Rate-Limit-Total`,
//     },
//     max: 100,
//     disableHeader: false,
//   })
// )

// session handler
// app.use(
//   session(
//     {
//       valid(ctx, sess) {
//         return ctx.cookies.get(`uid`) === sess.uid
//       },
//       beforeSave(ctx, sess) {
//         sess.uid = ctx.cookies.get(`uid`)
//       },
//       store: redis,
//     },
//     app
//   )
// )

app.use(bodyParser())

// router.post(`/donate/paypal`, endpointPaypal)
// router.post(`/donate/stripe`, endpointStripe)

/* maybe switch to single endpoint to orchestrate providers
for single point of request validation etc */
router.post(`/donate/`, async (ctx, next) => {
  const validationResult = validateEndpointDonation(ctx.request.body)
  if (validationResult.error) {
    ctx.status = 406
    ctx.body = {
      status: `error`,
      details: validationResult.error.details,
    }
    return false
  }

  const { paymentMethod } = ctx.request.body.form

  try {
    switch (paymentMethod) {
      case `stripe`:
        await endpointStripe(ctx, next)
        break
      case `paypal`:
        await endpointPaypal(ctx, next)
        break
    }
    return {
      status: `unknown`,
    }
  } catch (error) {
    return {
      status: `error`,
      message: error.message,
    }
  }
})

router.post(`/donate/stripe/payments/execute`, endpointStripeExecute)
router.post(`/donate/paypal/payments/execute`, endpointPaypalExecutePayment)
router.post(`/donate/paypal/agreements/execute`, endpointPaypalExecuteAgreement)

app.use(router.routes())
app.use(
  router.allowedMethods({
    throw: true,
    notImplemented: () => new Boom.notImplemented(),
    methodNotAllowed: () => new Boom.methodNotAllowed(),
  })
)

export const server = _port =>
  app.listen(port).on(`error`, err => {
    console.error(err)
  })
