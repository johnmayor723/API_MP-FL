const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Route to fetch products by category name
router.get("/:categoryName", categoryController.getProductsByCategory);

module.exports = router;
