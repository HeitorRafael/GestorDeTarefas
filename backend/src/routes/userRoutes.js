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

// @route   GET /api/admin/users
// @desc    Listar todos os usuários (Admin Only)
// @access  Private (Admin)
router.get('/', authMiddleware, adminAuthMiddleware, userController.getAllUsers);

// @route   DELETE /api/admin/users/:id
// @desc    Excluir usuário (Admin Only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, adminAuthMiddleware, userController.deleteUser);

// @route   PUT /api/users/change-password
// @desc    Alterar senha do próprio usuário
// @access  Private (qualquer usuário logado)
router.put('/change-password', authMiddleware, userController.changePassword);

// @route   PUT /api/admin/users/:id/reset-password
// @desc    Admin resetar senha de qualquer usuário
// @access  Private (Admin)
router.put('/:id/reset-password', authMiddleware, adminAuthMiddleware, userController.resetUserPassword);

// @route   GET /api/users/profile
// @desc    Obter perfil do usuário logado
// @access  Private (qualquer usuário logado)
router.get('/profile', authMiddleware, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Atualizar perfil do usuário logado (exceto senha)
// @access  Private (qualquer usuário logado)
router.put('/profile', authMiddleware, userController.updateUserProfile);

module.exports = router;