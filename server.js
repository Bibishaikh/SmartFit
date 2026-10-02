const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartfit')
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch((err) => console.log('Database Connection Error:', err));

// Test Route
app.get('/', (req, res) => {
    res.send('SmartFit Backend Server Running Successfully!');
});

// Auth Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));

// Users List Route (Database Data Dekhne Ke Liye)
app.get('/api/users-list', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Password chhod kar saari details dikhayega
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});