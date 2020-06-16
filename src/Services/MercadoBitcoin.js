const axios = require('axios')
const cryptoJS = require('crypto-js')

const { MERCADOBTC_ID, MERCADOBTC_SECRET } = process.env

const serialize = (obj) => {
  var str = []
  for (var p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
    }
  }
  return str.join('&')
}

const api = axios.default.create({
  baseURL: 'https://www.mercadobitcoin.net',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

api.interceptors.request.use((config) => {
  config.data.tapi_nonce = Math.round((new Date()).getTime() / 1000).toString()
  
  const TAPI_MAC = cryptoJS.HmacSHA512(`${encodeURI(config.url)}?${encodeURI(serialize(config.data))}`, MERCADOBTC_SECRET).toString()

  config.headers['TAPI-ID'] = MERCADOBTC_ID
  config.headers['TAPI-MAC'] = TAPI_MAC

  config.data = serialize(config.data)

  return config
})

class MercadoBitcoin {

  /**
   * Used for calling MercadoBitcoin API
   * @param {object} data The payload to MercadoBitcoin API
   * @param {object} data.tapi_method The MercadoBitcoin method
   */
  static async call(data = { tapi_method: '' }) {
    const response = await api.post('/tapi/v3/', data)
    
    if (response.data) {
      if (response.data.response_data) {
        return response.data.response_data
      } else {
        throw new Error(response.data.error_message)
      }
    } else {
      throw new Error('Could not connect to the MercadoBitcoin API')
    }
  }

  /**
   * Used for getting the account info from MercadoBitcoin
   */
  static async getAccountInfo() {
    return await MercadoBitcoin.call({
      tapi_method: 'get_account_info'
    })
  }

  /**
   * Used for getting the orders list from MercadoBitcoin
   * @param {string} coin_pair The coin pair. For example: "BRLBTC"
   */
  static async getOrdersList(coin_pair) {
    return await MercadoBitcoin.call({
      tapi_method: 'list_orders',
      coin_pair
    })
  }

  /**
   * Used for getting the order book list from MercadoBitcoin
   * @param {string} coin_pair The coin pair. For example: "BRLBTC"
   */
  static async getOrderBookList(coin_pair) {
    return await MercadoBitcoin.call({
      tapi_method: 'list_orderbook',
      full: true,
      coin_pair
    })
  }

  /**
   * Used for placing a sell order in MercadoBitcoin
   * @param {string} coin_pair The coin pair. For example: "BRLBTC"
   * @param {string} quantity The sell quantity
   * @param {string} limit_price Minimum sell price
   */
  static async placeSellOrder(coin_pair, quantity, limit_price) {
    return await MercadoBitcoin.call({
      tapi_method: 'place_sell_order',
      coin_pair,
      quantity,
      limit_price
    })
  }

  /**
   * Used for placing a sell order in MercadoBitcoin
   * @param {string} coin_pair The coin pair. For example: "BRLBTC"
   * @param {string} quantity The sell quantity
   */
  static async placeMarketSellOrder(coin_pair, quantity) {
    return await MercadoBitcoin.call({
      tapi_method: 'place_market_sell_order',
      coin_pair,
      quantity
    })
  }

  /**
   * Used for placing a buy order in MercadoBitcoin
   * @param {string} coin_pair The coin pair. For example: "BRLBTC"
   * @param {string} quantity The buy quantity
   * @param {string} limit_price Maximum buy price
   */
  static async placeBuyOrder(coin_pair, quantity, limit_price) {
    return await MercadoBitcoin.call({
      tapi_method: 'place_buy_order',
      coin_pair,
      quantity,
      limit_price
    })
  }

  /**
   * Used for placing a buy order in MercadoBitcoin
   * @param {string} coin_pair The coin pair. For example: "BRLBTC"
   * @param {string} cost The buy quantity
   */
  static async placeMarketBuyOrder(coin_pair, cost) {
    return await MercadoBitcoin.call({
      tapi_method: 'place_market_buy_order',
      coin_pair,
      cost
    })
  }

}

module.exports = MercadoBitcoin