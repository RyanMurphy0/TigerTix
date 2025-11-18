const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// public routes (no authentication needed)
router.post('/register', register);
router.post('/login', login);

// protected route example
router.get('/profile', verifyToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});
module.exports = router;