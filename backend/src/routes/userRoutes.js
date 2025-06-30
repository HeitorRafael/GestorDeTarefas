// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth'); // Middleware de autenticação
const adminAuthMiddleware = require('../middleware/adminAuth'); // Middleware para admin

// @route   POST /api/admin/users
// @desc    Cadastrar novo usuário (Admin Only)
// @access  Private (Admin)
router.post('/', authMiddleware, adminAuthMiddleware, userController.registerUser);

// @route   DELETE /api/admin/users/:id
// @desc    Excluir usuário (Admin Only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, adminAuthMiddleware, userController.deleteUser);

module.exports = router;