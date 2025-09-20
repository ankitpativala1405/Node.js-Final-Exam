const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register route
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.render('register', { 
                title: 'Register',
                error: 'All fields are required',
                formData: req.body
            });
        }

        if (password !== confirmPassword) {
            return res.render('register', { 
                title: 'Register',
                error: 'Passwords do not match',
                formData: req.body
            });
        }

        if (password.length < 6) {
            return res.render('register', { 
                title: 'Register',
                error: 'Password must be at least 6 characters long',
                formData: req.body
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.render('register', { 
                title: 'Register',
                error: 'User with this email or username already exists',
                formData: req.body
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax'
        });

        res.redirect('/articles');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { 
            title: 'Register',
            error: 'An error occurred during registration',
            formData: req.body
        });
    }
});

// Login route
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.render('login', { 
                title: 'Login',
                error: 'Email and password are required',
                formData: req.body
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { 
                title: 'Login',
                error: 'Invalid email or password',
                formData: req.body
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { 
                title: 'Login',
                error: 'Invalid email or password',
                formData: req.body
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax'
        });

        res.redirect('/articles');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { 
            title: 'Login',
            error: 'An error occurred during login',
            formData: req.body
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
});

module.exports = router;
