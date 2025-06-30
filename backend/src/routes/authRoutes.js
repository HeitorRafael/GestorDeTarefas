// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post('/login', authController.login);

module.exports = router;