const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
  
  
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  measurements: [measurementSchema] // Embedding the measurements schema as an array
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
