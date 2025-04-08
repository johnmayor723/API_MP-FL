const Product = require('../models/Product');

// Create a new product
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
};

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

// Update product
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
};
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
