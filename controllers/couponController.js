const Coupon = require('../models/Coupon');
const { v4: uuidv4 } = require('uuid');

// Create a Coupon
exports.createCoupon = async (req, res) => {
  const { couponName, promoIdentifier, agentIdentifier } = req.body;

  try {
    // Generate a unique coupon ID
    const couponId = uuidv4();

    const newCoupon = new Coupon({
      couponId,
      promoIdentifier,
      agentIdentifier,
      isValid: true,
      name: couponName,
      remainingValue: 50000, // Initial value
    });

    await newCoupon.save();

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon: newCoupon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
