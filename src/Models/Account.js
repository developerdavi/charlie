const { Schema, model } = require('mongoose')

const accountInfoSchema = new Schema({
  balance: {
    type: Object,
    required: true
  },
  withdrawal_limits: {
    type: Object,
    required: true
  }
}, {
  timestamps: true
})

const AccountInfo = model('accounts', accountInfoSchema)

module.exports = AccountInfo