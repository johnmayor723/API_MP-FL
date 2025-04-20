const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  mobile: String,
  ordernotes: String,
  totalAmount: Number,
  paymentmethod: String,
  code: String,

  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  },
  orderId: {
    type: String,
    unique: true,
    default: uuidv4,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);


