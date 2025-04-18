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
  mobileRequestPasswordReset, 
  mobileResetPassword,
  googleLogin,
  getAllUsers,
  deleteUserByEmail,
  getUserByEmail
} = require("../controllers/authController");
const JWTSECRET = "dfgghhyy65443322edfhhhjj";
// **Google Login Route

const twilio = require('twilio')

// Twilio Credentials
const TWILIO_SID = "ACd9128943daa2cd9628701dc936448230";
const TWILIO_AUTH_TOKEN = "7e2e2e32dcb970f9d05ee2f75bc05194";

const TWILIO_VERIFY_SID = "VA5fba2e26e3d83968bda8b1f3f1b0eab8"

const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

//google auth route
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
        const token = jwt.sign({ userId: user._id }, JWTSECRET, { expiresIn: "7d" });

        res.json({ user, token });
    } catch (error) {
        console.error("API Google Auth Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/register", register)


// Delete all users (Use with caution)
/*router.delete("/", async (req, res) => {
    try {
        await User.deleteMany({});
        res.json({ message: "All users deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete users", details: error.message });
    }
});*/

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


//  **Step 1: Handle Name & Phone Number, Send OTP**
// Handle Name & Phone Number, Send OTP
router.post("/send-otp", async (req, res) => {
  const { name, phoneNumber } = req.body;
  const email = req.body.email ? req.body.email.trim().toLowerCase() : `user_${phoneNumber}@example.com`;
  console.log("Received request to send OTP:", { name, phoneNumber });

  if (!name || !phoneNumber) {
    console.error("Error: Missing name or phone number");
    return res.status(400).json({ error: "Phone number and name are required" });
  }

  const formattedPhone = phoneNumber.startsWith("+234") ? phoneNumber : `+234${phoneNumber}`;
  console.log("Formatted phone number:", formattedPhone);

  try {
    let user = await User.findOne({ phoneNumber:formattedPhone});
    console.log("User found:", user);

    if (!user) {
      user = new User({ name, phoneNumber:formattedPhone, email});
      await user.save();
      console.log("New user created:", user);
    }

    console.log("Sending OTP via Twilio to:", formattedPhone);
    const response = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SID)
      .verifications.create({ to: formattedPhone, channel: "sms" });

    console.log("Twilio OTP Response:", response);
    res.json({ success: true, message: "OTP sent", phoneNumber: formattedPhone });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP", details: error.message });
  }
});

/// confirm otp route
router.post("/confirm-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;
  console.log("Received request to confirm OTP:", { phoneNumber, otp });

  if (!phoneNumber || !otp) {
    console.error("Error: Missing phone number or OTP");
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  const formattedPhone = phoneNumber.startsWith("+234") ? phoneNumber : `+234${phoneNumber}`;
  console.log("Formatted phone number:", formattedPhone);

  try {
    // Verify OTP via Twilio
    console.log("Verifying OTP with Twilio...");
    const verification = await twilioClient.verify.v2
      .services(TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: formattedPhone, code: otp });

    console.log("Twilio OTP Verification Response:", verification);

    if (verification.status !== "approved") {
      console.error("Invalid OTP:", verification);
      return res.status(400).json({ error: "Invalid OTP" });
    }

    let user = await User.findOne({ phoneNumber:formattedPhone });
    console.log("User found:", user);

    if (!user) {
      console.error("User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    // Generate JWT Token for authentication
    const token = jwt.sign({ phoneNumber: user.phoneNumber, name: user.name }, JWTSECRET, {
      expiresIn: "7d",
    });

    console.log("JWT Token generated for user:", user);
    res.json({ success: true, message: "OTP verified", token, user });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP", details: error.message });
  }
});
//user's coupon routes

// Validate Active Coupon
router.post('/activate-coupon', activateCoupon);

// Validate Active Coupon
router.post('/validate-coupon', validateCoupon);

// Update Coupon Value
router.put('/update-coupon', updateCouponValue);

// user accounts routes
router.get("/", getAllUsers);
router.get('/:email', getUserByEmail);
router.delete('/:email', deleteUserByEmail);
router.post("/wishlist",  addToWishlist);
router.post("/recently-viewed", addToRecentlyViewed);
router.post("/update-order-history", updateOrderHistory);
router.put("/update-address", updateAddress);
router.post("/profile", getUserProfile);
router.get("/verify-email/:token", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);
router.post("/mobile-request-password-reset", mobileRequestPasswordReset);
router.post("/mobile-reset-password", mobileResetPassword);
router.post("/google-login", googleLogin);


module.exports = router;