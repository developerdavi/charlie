const mongoose = require('mongoose')

// Helpers
const Log = require('../Helpers/Logger')

const { MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE } = process.env

const config = {
  poolSize: 4,
  keepAlive: true,
  keepAliveInitialDelay: 300000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  autoIndex: false,
  useFindAndModify: false
}

class Database {
  /**
   * Used for connecting to a mongodb server instance
   */
  static async connect() {
    const connected = await mongoose.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`, config)

    if (connected) {
      Log('[!] Successfully connected to MongoDB', false, ['green'])
    } else {
      throw new Error('Could not connect to MongoDB')
    }
  }
}

module.exports = Database
