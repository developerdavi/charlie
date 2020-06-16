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

    this.accountUpdater = new Runner({
      name: 'Account updater',
      delay: 10000,
      logs: true,
      shouldStartNow: true,
      task: this.updateAccountInfo.bind(this)
    })

    this.previousData = {
      diff_ask: 0,
      diff_bid: 0,
      difference: false
    }

    this.account = {
      balance: {
        btc: {
          available: 0
        },
        brl: {
          available: 0
        }
      }
    }
  }

  async start() {
    this.runner.start()
  }

  async run() {
    this.account = await Account.findOne()

    Log('[!] Account', false, ['yellow'])
    Log(`Balance (BTC): \t${this.account.balance.btc.available}`, false, ['blue'])
    Log(`Balance (BRL): \t${Number.parseFloat(this.account.balance.brl.available).toFixed(2)}`, false, ['blue'])
    
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

    await this.decide(difference, lastAsk.limit_price, lastBid.limit_price)

    Log('===========================================')

    this.previousData.diff_ask = diff_ask
    this.previousData.diff_bid = diff_bid
    this.previousData.difference = difference
  }

  async updateAccountInfo() {
    const data = await MercadoBitcoin.getAccountInfo()

    return await Account.updateOne({ }, data, { upsert: true })
  }

  async decide(difference, askValue) {
    if(this.previousData.difference === false) {
      return
    } 

    const variation = difference - this.previousData.difference

    Log(`Current - Prev:\tR$ ${variation.toFixed(2)}`, false, ['pink'])
    
    if (variation > 20 && difference > 100) {
      const amount = difference * 0.5

      if (Number.parseFloat(this.account.balance.btc.available) > (amount / askValue * 0.958 * 0.4)) {
        Log(`[ASK] R$ ${amount.toFixed(2)} | BTC ${amount / (askValue * 0.958) * 0.4} @ R$ ${Number.parseFloat(askValue * 0.958).toFixed(2)}`, false, ['red'])

        await MercadoBitcoin.placeSellOrder('BRLBTC', (amount / askValue * 0.4).toFixed(8), (askValue * 0.958).toFixed(5))
        await this.updateAccountInfo()
      } else {
        Log('[!] Unable to place sell order due to insufficient balance')
      }
    } else if (variation < -20 && difference > 100) {
      const amount = difference * 0.45

      if (Number.parseFloat(this.account.balance.brl.available) > amount) {
        Log(`[BID] R$ ${amount.toFixed(2)} | BTC ${(amount / askValue * 0.95).toFixed(2)} @ R$ ${Number.parseFloat(askValue * 0.95).toFixed(2)}`, false, ['green'])

        await MercadoBitcoin.placeBuyOrder('BRLBTC', (amount / askValue * 0.95).toFixed(8), (askValue * 0.95).toFixed(5))
        await this.updateAccountInfo()
      } else {
        Log('[!] Unable to place buy order due to insufficient balance')
      }
    }
  }
}

module.exports = Charlie