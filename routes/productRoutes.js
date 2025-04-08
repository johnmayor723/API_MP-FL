const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require("../config/helpers")

// Create a new product (Admin only)
router.post('/', upload.any(), productController.createProduct);

// Get all products (Public)
router.get('/', productController.getAllProducts);

// Get a single product by ID (Public)
router.get('/:id', productController.getProductById);

// Update a product (Admin only)
router.put('/:id',upload.any() productController.updateProduct);

// Delete a product (Admin only)
router.delete('/:id', productController.deleteProduct);

module.exports = router;