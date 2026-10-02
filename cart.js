const express = require('express');
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');

const router = express.Router();

// ADD PRODUCT TO CART
router.post('/add', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'smartfit_secret_key'
        );

        const { productName, price, size, quantity } = req.body;

        if (!productName || !price || !size) {
            return res.status(400).json({
                message: 'Product name, price and size are required'
            });
        }

        const cartItem = new Cart({
            userId: decoded.id,
            productName: productName,
            price: price,
            size: size,
            quantity: quantity || 1
        });

        await cartItem.save();

        res.status(201).json({
            message: 'Product added to cart successfully',
            cartItem: cartItem
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Failed to add product to cart'
        });
    }
});
// GET LOGGED-IN USER'S CART
router.get('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Please login first'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'smartfit_secret_key'
        );

        const cartItems = await Cart.find({
            userId: decoded.id
        }).populate('userId', 'name email');

        res.json(cartItems);

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Failed to fetch cart'
        });
    }
});
// UPDATE CART QUANTITY
// POST /api/cart/update/:id

router.post('/update/:id', async (req, res) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Please login first'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'smartfit_secret_key'
        );

        const { quantity } = req.body;

        if (quantity === undefined || Number(quantity) < 1) {
            return res.status(400).json({
                message: 'Quantity must be at least 1'
            });
        }

        const updatedItem = await Cart.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: decoded.id
            },
            {
                quantity: Number(quantity)
            },
            {
                new: true
            }
        );

        if (!updatedItem) {
            return res.status(404).json({
                message: 'Cart item not found'
            });
        }

        res.json({
            message: 'Quantity updated successfully',
            cartItem: updatedItem
        });

    } catch (error) {

        console.log('UPDATE CART ERROR:', error);

        res.status(500).json({
            message: 'Failed to update quantity'
        });
    }
});


// DELETE CART ITEM
router.delete('/:id', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Please login first'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'smartfit_secret_key'
        );

        const deletedItem = await Cart.findOneAndDelete({
            _id: req.params.id,
            userId: decoded.id
        });

        if (!deletedItem) {
            return res.status(404).json({
                message: 'Cart item not found'
            });
        }

        res.json({
            message: 'Cart item deleted successfully'
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Failed to delete cart item'
        });
    }
});
module.exports = router;