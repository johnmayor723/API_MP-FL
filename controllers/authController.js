const User = require('../models/User');
const Coupon = require('../models/Coupon');
const CouponCode = require('../models/CouponCode')

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};


// Activate Coupon for a User
exports.activateCoupon = async (req, res) => {
  try {
    // Fetch the authenticated user's ID from the session
    const {userId} = req.body;

    // Validate if the user ID exists in the session
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { couponCode } = req.body;

    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user already has a valid coupon
    const existingValidCoupon = await Coupon.findOne({ userId, isValid: true });
    if (existingValidCoupon) {
      return res
        .status(400)
        .json({ message: 'You already have an active coupon' });
    }

    // Fetch the coupon code from the CouponCode model
    const validCouponCode = await CouponCode.findOne({ couponCode });
    if (!validCouponCode || !validCouponCode.isValid) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired coupon code' });
    }

    // Generate a unique ID for the activated coupon
    const couponId = uuidv4();

    // Save the activated coupon in the Coupon model
    const activatedCoupon = new Coupon({
      userId,
      couponId,
      couponCode: validCouponCode.couponCode,
      value: 50000, // Coupon value in Naira
      isValid: true, // Mark the coupon as valid
      activatedAt: new Date(),
    });

    await activatedCoupon.save();

    // Mark the coupon code as used in the CouponCode model
    //validCouponCode.isValid = false;
    await validCouponCode.save();

    res.status(200).json({
      message: 'Coupon activated successfully',
      coupon: {
        couponId,
        couponCode: validCouponCode.couponCode,
        value: 50000,
      },
    });
  } catch (error) {
    console.error('Error activating coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Validate Active Coupon
exports.validateCoupon = async (req, res) => {
  try {
    // Fetch the authenticated user's ID from the session
    const {userId} = req.body;

    // Validate if the user ID exists in the session
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check the Coupon model for a valid coupon associated with the user
    const validCoupon = await Coupon.findOne({ userId, isValid: true });

    if (!validCoupon) {
      return res.status(404).json({
        message: 'No active coupon found for this user',
      });
    }

    // Return the details of the valid coupon, including its current/remaining value
    res.status(200).json({
      message: 'Valid coupon found',
      coupon: {
        couponId: validCoupon.couponId,
        couponCode: validCoupon.couponCode,
        value: validCoupon.value, // Assuming `value` represents the remaining value
        activatedAt: validCoupon.activatedAt,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Coupon Value
exports.updateCouponValue = async (req, res) => {
  const { couponCode, usedValue } = req.body;

  try {
    // Fetch the authenticated user's ID from the session
    const {userId} = req.body;

    // Validate if the user ID exists in the session
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find an active coupon associated with the user and matching the coupon code
    const coupon = await Coupon.findOne({ userId, couponCode, isValid: true });

    if (!coupon) {
      return res.status(404).json({
        message: 'No valid coupon found for this user',
      });
    }

    // Deduct the used value from the coupon
    coupon.value -= usedValue;

    // Mark the coupon as invalid if the value is exhausted
    if (coupon.value <= 0) {
      coupon.isValid = false;
      coupon.value = 0; // Ensure no negative values
    }

    // Save the updated coupon
    await coupon.save();

    res.status(200).json({
      message: 'Coupon value updated successfully',
      remainingValue: coupon.value,
      isValid: coupon.isValid,
    });
  } catch (error) {
    console.error('Error updating coupon value:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const user = req.user; // Assume req.user is populated from protect middleware
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ message: "Product ID is required." });

    // Check if the product is already in the wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist." });
    }

    // Add to the wishlist
    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ message: "Product added to wishlist.", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Add to Recently Viewed
exports.addToRecentlyViewed = async (req, res) => {
  try {
    const user = req.user; // Assume req.user is populated from protect middleware
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ message: "Product ID is required." });

    // Remove the product if it already exists in the recentlyViewed array
    user.recentlyViewed = user.recentlyViewed.filter((id) => id.toString() !== productId);

    // Add the product to the beginning of the array
    user.recentlyViewed.unshift(productId);

    // Ensure the array does not exceed 10 products
    if (user.recentlyViewed.length > 10) {
      user.recentlyViewed.pop();
    }

    await user.save();

    res.status(200).json({ message: "Product added to recently viewed.", recentlyViewed: user.recentlyViewed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update Order History
exports.updateOrderHistory = async (req, res) => {
  try {
    const user = req.user; // Assume req.user is populated from protect middleware
    const { orderId } = req.body;

    if (!orderId) return res.status(400).json({ message: "Order ID is required." });

    // Add the order to the user's purchase history
    user.purchaseHistory.push(orderId);
    await user.save();

    res.status(200).json({ message: "Order history updated.", purchaseHistory: user.purchaseHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const user = req.user; // Assume req.user is populated from protect middleware
    const { address } = req.body;

    if (!address) return res.status(400).json({ message: "Address is required." });

    // Update the user's address
    user.address = address;
    await user.save();

    res.status(200).json({ message: "Address updated.", address: user.address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  // Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.body; // Get userId from request body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId); // Find user by ID

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user }); // Return found user as JSON
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
