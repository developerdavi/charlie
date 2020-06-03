require('dotenv').config()

// Services
const Database = require('./Services/Database')
const Charlie = require('./Services/Charlie')

// Helpers
const Log = require('./Helpers/Logger')

async function start() {
  try {
    await Database.connect()

    const bot = new Charlie()

    bot.start()
  } catch (e) {
    Log(`[!] ${e.message}`, false, ['red'])
  }
}

start()