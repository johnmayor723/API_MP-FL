const mongoose = require('mongoose');

const couponCodeSchema = new mongoose.Schema({
  couponCode: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, // Remove whitespace
  },
  isValid: { 
    type: Boolean, 
    default: true, // Default to true when the coupon is created
  },
});

module.exports = mongoose.model('CouponCode', couponCodeSchema);
