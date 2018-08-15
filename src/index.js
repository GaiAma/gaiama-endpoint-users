import '@/env'
import pino from 'pino'
import mongoose from 'mongoose'
import { server } from '@/server'
import { connectDatabase } from '@/db'

const logger = pino({ name: `index` })

process.on(`SIGTERM`, async () => {
  logger.info(`Starting graceful shutdown`)
  let exitCode = 0

  try {
    mongoose.disconnect()
  } catch (error) {
    exitCode = 1
    logger.error(`Error in graceful shutdown `, error)
  }

  logger.info(`gacefully stopped`)
  process.exit(exitCode)
})

connectDatabase()
  .then(() => {
    try {
      const app = server()
      logger.info(`listening on port ${app.address().port}`)
    } catch (error) {
      logger.error(error)
    }
  })
  .catch(() => logger.error(`couldn't connect to db`))
