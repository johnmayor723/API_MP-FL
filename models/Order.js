// models/Order.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  shippingAddress: String,
  code: String,
  totalAmount: Number,
  
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered'],
    default: 'processing',
  },
  orderId: {
    type: String,
    unique: true,
    default: uuidv4,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
