const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


// ================= REGISTER =================

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Please fill all fields'
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        // Save to MongoDB
        await user.save();

        res.status(201).json({
            message: 'Registration successful'
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});


// ================= LOGIN =================

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please enter email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Create token
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET || 'smartfit_secret_key',
            {
                expiresIn: '1d'
            }
        );

        res.json({
            message: 'Login successful',

            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'smartfit_secret_key'
        );

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            user: user
        });

    } catch (error) {
        console.log(error);

        res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
});
module.exports = router;