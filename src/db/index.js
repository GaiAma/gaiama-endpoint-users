import pino from 'pino'
import mongoose from 'mongoose'
import bluebird from 'bluebird'

mongoose.Promise = bluebird

const {
  NODE_ENV,
  // MONGODB_USER,
  // MONGODB_PASS,
  MONGODB_URI,
} = process.env
const logger = pino({ name: `db/index` })

console.log(MONGODB_URI)

const options = {
  useNewUrlParser: true,
  // user: MONGODB_USER,
  // pass: MONGODB_PASS,
  reconnectTries: 30, // Retry up to 30 times
  reconnectInterval: 500, // Reconnect every 500ms
  autoIndex: NODE_ENV !== `production`,
}

if (NODE_ENV === `development`) {
  mongoose.set(`debug`, true)
}

const connectWithRetry = () =>
  mongoose.connect(
    MONGODB_URI,
    options
  )

export const connectDatabase = async () => {
  try {
    const db = mongoose.connection
    db.on(`error`, error => {
      logger.error(console, `connection error:`, error)
      // Promise.reject(error)
      // Exit application on error
      setTimeout(connectWithRetry, 5000)
    })
    db.on(`close`, logger.error.bind(logger, `connection closed:`))
    db.once(`open`, () => {
      // we're connected!
      logger.info(`successfully connected to database`)
      // Promise.resolve(mongoose.connection)
    })

    connectWithRetry()
  } catch (error) {
    logger.error(error)
  }
}
