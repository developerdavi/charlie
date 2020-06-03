const { Schema, model } = require('mongoose')

const orderSchema = new Schema({
  order_id: {
    type: Number,
    required: true
  },
  coin_pair: {
    type: String,
    required: true
  },
  order_type: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    required: true,
    default: 2
  },
  has_fills: {
    type: Boolean,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  limit_price: {
    type: String,
    required: true
  },
  executed_quantity: {
    type: String,
    required: true
  },
  executed_price_avg: {
    type: String,
    required: true
  },
  fee: {
    type: String,
    required: true
  },
  created_timestamp: {
    type: String,
    required: true
  },
  updated_timestamp: {
    type: String,
    required: true
  },
  operations: {
    type: [Object],
    required: true
  }
}, {
  timestamps: true
})

const Order = model('orders', orderSchema)

module.exports = Order