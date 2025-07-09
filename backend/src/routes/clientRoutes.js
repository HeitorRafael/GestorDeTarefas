// backend/src/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

// @route   GET /api/clients
// @desc    Listar todos os clientes (todos os usuários podem ver)
// @access  Private (usuário comum e admin)
router.get('/', authMiddleware, clientController.getAllClients);

// @route   POST /api/admin/clients
// @desc    Adicionar novo cliente (Admin Only)
// @access  Private (Admin)
router.post('/', authMiddleware, adminAuthMiddleware, clientController.addClient);
router.post('', authMiddleware, adminAuthMiddleware, clientController.addClient);

// @route   DELETE /api/admin/clients/:id
// @desc    Excluir cliente (Admin Only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, adminAuthMiddleware, clientController.deleteClient);

module.exports = router;