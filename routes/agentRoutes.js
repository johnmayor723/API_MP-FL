const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const CouponCode = require('../models/CouponCode'); // CouponCode model

// Route to create an agent
router.post('/', async (req, res) => {
  const { name, email, couponCode } = req.body;
  const isValid = true
  try {
    const agentExists = await Agent.findOne({ email });
    if (agentExists) {
      return res.status(400).json({ message: 'Agent already exists' });
    }

    // Save couponCode to the CouponCode model
    const coupon = new CouponCode({ couponCode, isValid });
    await coupon.save();

    // Save agent with reference to the couponCode
    const agent = new Agent({
      name,
      email,
      couponCode,
      totalSales: 0, // Default value
    });

    await agent.save();
    res.status(201).json({ message: 'Agent created successfully', agent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find();
    res.status(200).json({ message: 'Agents retrieved successfully', agents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update an agent's couponCode by email
router.put('/', async (req, res) => {
  const { email, couponCode } = req.body;

  try {
    // Find the agent by email
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Update the couponCode in the CouponCode model and set isValid to true
    await CouponCode.findOneAndUpdate(
      { couponCode: agent.couponCode }, // Find the existing couponCode
      { couponCode, isValid: true }, // Update with the new code and isValid
      { new: true, upsert: true } // Create a new entry if it doesn't exist
    );

    // Update the couponCode in the Agent model
    agent.couponCode = couponCode;
    await agent.save();

    res.status(200).json({ message: 'Agent updated successfully', agent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Agent's Total Sales
router.patch('/', async (req, res) => {
  const { couponCode, amount } = req.body;

  try {
    const agent = await Agent.findOne({ couponIdentifier });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.totalSales += amount;
    await agent.save();

    res.status(200).json({ message: 'Agent sales updated', totalSales: agent.totalSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
