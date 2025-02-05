const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { 
  register, 
  login, 
  activateCoupon, 
  validateCoupon, 
  updateCouponValue, 
  addToWishlist, 
  addToRecentlyViewed, 
  updateOrderHistory, 
  getUserProfile, 
  updateAddress 
} = require("../controllers/authController");


// Register a new user
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role} = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }
       
       // Create new user object
      user = new User({
        name,
        email,
        password,
        role: role && role === 'admin' ? 'admin' : 'user' // Conditional role assignment
      });
      
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(payload, "dfgghhyy65443322edfhhhjj", { expiresIn: '1h' });
      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Login user and get token
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(payload, "dfgghhyy65443322edfhhhjj", { expiresIn: '1h' });
      res.json({ 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);
//user's coupon routes

// Validate Active Coupon
router.post('/activate-coupon', activateCoupon);

// Validate Active Coupon
router.post('/validate-coupon', validateCoupon);

// Update Coupon Value
router.post('/update-coupon', updateCouponValue);

// user accounts routes
router.post("/wishlist",  addToWishlist);
router.post("/recently-viewed", addToRecentlyViewed);
router.post("/update-order-history", updateOrderHistory);
router.post("/update-address", updateAddress);
router.get("/profile", getUserProfile);


module.exports = router;
