const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // To handle file system operations


// Set up storage for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save images in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Set up storage for measurements
const measurementStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save measurement images in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadProduct = multer({ storage: productStorage });
const uploadMeasurement = multer({ storage: measurementStorage });


// Create product controller
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, measurements } = req.body;

    // Process the image URL (Main product image)
    let imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // Parse measurements if it's a JSON string
    let parsedMeasurements = [];
    if (measurements) {
      parsedMeasurements = typeof measurements === 'string'
        ? JSON.parse(measurements)
        : measurements;
    }

    // Process the measurements' images (if any)
    let measurementData = [];
    if (parsedMeasurements.length > 0) {
      parsedMeasurements.forEach((measurement, i) => {
        let measurementImageUrl = '';
        if (req.files && req.files[i]) {
          measurementImageUrl = `/uploads/${req.files[i].filename}`;
        }
        measurementData.push({
          ...measurement,
          imageUrl: measurementImageUrl || ''
        });
      });
    }

    // Create a new product
    const newProduct = new Product({
      name,
      description,
      category,
      price,
      stock,
      imageUrl,
      measurements: measurementData
    });

    // Save the new product to the database
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/* Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, imageUrl } = req.body;

    // Parse measurements if it's a JSON string
    let measurements = [];
    if (req.body.measurements) {
      measurements = typeof req.body.measurements === 'string'
        ? JSON.parse(req.body.measurements)
        : req.body.measurements;
    }

    const newProduct = new Product({
      name,
      description,
      category,
      price,
      stock,
      imageUrl,
      measurements // Parsed measurements
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};*/

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update product controller
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock, measurements } = req.body;

    // Parse measurements if it's a JSON string
    let parsedMeasurements = [];
    if (measurements) {
      parsedMeasurements = typeof measurements === 'string'
        ? JSON.parse(measurements)
        : measurements;
    }

    // Process the image URL (Main product image)
    let imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.existingImageUrl || '';

    // Process the measurements' images (if any)
    let measurementData = [];
    if (parsedMeasurements.length > 0) {
      parsedMeasurements.forEach((measurement, i) => {
        let measurementImageUrl = '';
        if (req.files && req.files[i]) {
          measurementImageUrl = `/uploads/${req.files[i].filename}`;
        }
        measurementData.push({
          ...measurement,
          imageUrl: measurementImageUrl || measurement.existingImageUrl || ''
        });
      });
    }

    // Find the product by ID and update it
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      name,
      description,
      category,
      price,
      stock,
      imageUrl,
      measurements: measurementData
    }, { new: true });  // `new: true` returns the updated product

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/*Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, imageUrl } = req.body;

    // Parse measurements if it's a JSON string
    let measurements = [];
    if (req.body.measurements) {
      measurements = typeof req.body.measurements === 'string'
        ? JSON.parse(req.body.measurements)
        : req.body.measurements;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        price,
        stock,
        imageUrl,
        measurements // Parsed measurements
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};*/
// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
