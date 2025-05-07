// controllers/cartController.js

const Cart = require('../models/Cart');
const Product = require('../models/Product');

function formatCart(cart) {
  let formattedCart = 'Your cart contains:\n\n';
  let totalAmount = 0;

  cart.forEach(item => {
    formattedCart += `Name: ${item.name}\n`;
    formattedCart += `Price: $${item.price}\n`;
    formattedCart += `Quantity: ${item.qty}\n`;
    formattedCart += `-----------------\n`;
    totalAmount += item.price * item.qty;
  });

  formattedCart += `Total Price: $${totalAmount.toFixed(2)}\n`;
  return formattedCart;
}




// Get Cart
const getCart = async (req, res, next) => {
  try {
    if (!req.session.cart) {
      return res.status(200).json({ products: null, totalPrice: 0 });
    }

    const cart = new Cart(req.session.cart.items);
    res.status(200).json({
      products: cart.generateArray(),
      totalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching the cart', error });
  }
};

// Add to Cart
const addToCart = async (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart.items : {});

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.status(200).json({ message: 'Product added to cart', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while adding to cart', error });
  }
};

// Remove from Cart
const removeFromCart = async (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart.items : {});

  try {
    if (!cart.items[productId]) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart.remove(productId);
    req.session.cart = cart;
    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while removing from cart', error });
  }
};

// Clear Cart
const
    clearCart = async (req, res, next) => {
  try {
    req.session.cart = null; // Clear the cart by setting it to null
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while clearing the cart', error });
  }
};

// Exporting all functions


module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    clearCart
};
