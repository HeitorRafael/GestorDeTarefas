// backend/src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

// @route   GET /api/tasks
// @desc    Listar todas as tarefas (todos os usuários podem ver)
// @access  Private (usuário comum e admin)
router.get('/', authMiddleware, adminAuthMiddleware, taskController.getAllTasks);

// @route   POST /api/admin/tasks
// @desc    Adicionar nova tarefa (Admin Only)
// @access  Private (Admin)
router.post('/', authMiddleware, adminAuthMiddleware, taskController.addTask);
router.post('', authMiddleware, adminAuthMiddleware, taskController.addTask);

// @route   DELETE /api/admin/tasks/:id
// @desc    Excluir tarefa (Admin Only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, adminAuthMiddleware, taskController.deleteTask);

module.exports = router;