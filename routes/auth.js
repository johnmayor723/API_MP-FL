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
  updateAddress, 
  verifyEmail, 
  requestPasswordReset, 
  resetPassword,
  googleLogin
} = require("../controllers/authController");

// **Google Login Route (API)**
router.post("/google-auth", async (req, res) => {
    const { email, name, googleId } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            // Prevent duplicate registration
            const hashedPassword = await bcrypt.hash(googleId, 10); // Hash Google ID as default password
            user = new User({ name, email, googleId, password: hashedPassword });
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ user, token });
    } catch (error) {
        console.error("API Google Auth Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/register", register)
/*Register a new user
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
);*/

// Delete all users (Use with caution)
router.delete("/", async (req, res) => {
    try {
        await User.deleteMany({});
        res.json({ message: "All users deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete users", details: error.message });
    }
});

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
router.put('/update-coupon', updateCouponValue);

// user accounts routes
router.post("/wishlist",  addToWishlist);
router.post("/recently-viewed", addToRecentlyViewed);
router.post("/update-order-history", updateOrderHistory);
router.put("/update-address", updateAddress);
router.post("/profile", getUserProfile);
router.get("/verify-email/:token", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.post("/google-login", googleLogin);


module.exports = router;
