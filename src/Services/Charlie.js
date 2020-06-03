// Services
const MercadoBitcoin = require('./MercadoBitcoin')

// Helpers
const Runner = require('../Helpers/Runner')
const Log = require('../Helpers/Logger')

// Models
const Account = require('../Models/Account')
// const Order = require('../Models/Order')

class Charlie {
  constructor() {
    this.runner = new Runner({
      name: 'Charlie trader main',
      delay: 5000,
      logs: false,
      shouldStartNow: false,
      task: this.run.bind(this)
    })

    this.previousData = {
      diff_ask: 0,
      diff_bid: 0,
      difference: 0
    }
  }

  async start() {
    this.runner.start()
  }

  async run() {
    const account = await Account.findOne()

    Log('[!] Account', false, ['yellow'])
    Log(`Balance (BTC): \t${account.balance.btc.available}`, false, ['blue'])
    Log(`Balance (BRL): \t${Number.parseFloat(account.balance.brl.available).toFixed(2)}`, false, ['blue'])
    
    Log('===========================================')

    const { orderbook } = await MercadoBitcoin.getOrderBookList('BRLBTC')

    const [lastAsk] = orderbook.asks.slice(-1)
    const [lastBid] = orderbook.bids.slice(-1)
    
    Log('[!] Asks', false, ['yellow'])

    const amounts_ask = orderbook.asks.map(x => x.limit_price)
    
    const average_ask = amounts_ask.reduce((previous, current) => Number.parseFloat(previous) + Number.parseFloat(current)) / orderbook.asks.length

    const diff_ask = Number.parseFloat(lastAsk.limit_price) - average_ask.toFixed(2)
    
    if (average_ask < Number.parseFloat(lastAsk.limit_price)) {
      Log(`Last:\t\tR$ ${Number.parseFloat(lastAsk.limit_price).toFixed(2)}`, false, ['green'])
      Log(`Average:\tR$ ${average_ask.toFixed(2)}`, false, ['green'])
      Log(`Difference:\tR$ ${diff_ask.toFixed(2)}`, false, ['green'])
    } else {
      Log(`Last:\t\tR$ ${Number.parseFloat(lastAsk.limit_price).toFixed(2)}`, false, ['red'])
      Log(`Average:\tR$ ${average_ask.toFixed(2)}`, false, ['red'])
      Log(`Difference:\tR$ ${diff_ask.toFixed(2)}`, false, ['red'])
    }

    Log('===========================================')
    
    Log('[!] Bids', false, ['yellow'])

    const amounts_bid = orderbook.bids.map(x => x.limit_price)
    
    const average_bid = amounts_bid.reduce((previous, current) => Number.parseFloat(previous) + Number.parseFloat(current)) / orderbook.bids.length

    const diff_bid = Number.parseFloat(lastBid.limit_price) - average_bid.toFixed(2)
    
    if (average_bid < Number.parseFloat(lastBid.limit_price)) {
      Log(`Last:\t\tR$ ${Number.parseFloat(lastBid.limit_price).toFixed(2)}`, false, ['red'])
      Log(`Average:\tR$ ${average_bid.toFixed(2)}`, false, ['green'])
      Log(`Difference:\tR$ ${diff_bid.toFixed(2)}`, false, ['green'])
    } else {
      Log(`Last:\t\tR$ ${Number.parseFloat(lastBid.limit_price).toFixed(2)}`, false, ['red'])
      Log(`Average:\tR$ ${average_bid.toFixed(2)}`, false, ['red'])
      Log(`Difference:\tR$ ${diff_bid.toFixed(2)}`, false, ['red'])
    }

    Log('===========================================')

    Log('[!] Difference', false, ['yellow'])

    const difference = diff_ask + diff_bid

    if (difference > 0) {
      Log(`Difference:\tR$ ${difference.toFixed(2)}`, false, ['green'])
    } else {
      Log(`Difference:\tR$ ${difference.toFixed(2)}`, false, ['red'])
    }

    this.decide(difference, lastAsk.limit_price)

    Log('===========================================')

    this.previousData.diff_ask = diff_ask
    this.previousData.diff_bid = diff_bid
    this.previousData.difference = difference
  }

  async updateAccountInfo() {
    const data = await MercadoBitcoin.getAccountInfo()

    return await Account.updateOne({ }, data, { upsert: true })
  }
  

  decide(difference, btcbrl) {
    const variation = difference - this.previousData.difference
    
    const value = difference * btcbrl * 0.0001

    Log(`Current - Prev:\tR$ ${variation.toFixed(2)}`, false, ['pink'])
  }
}

module.exports = Charlie