const express = require('express');
const router = express.Router();
//const { protect } = require('../middleware/authMiddleware');
/*
const {
    addToCart,
    getCart,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');
*/

// routes/cart.js

//const express = require('express');
//const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getCart);
router.post('/:id', cartController.addToCart);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;


/*router.post('/',  addToCart);
router.get('/',  getCart);
router.delete('/:id',  removeFromCart);
router.delete('/',  clearCart);

module.exports = router;*/
