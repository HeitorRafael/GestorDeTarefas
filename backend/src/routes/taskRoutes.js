// backend/src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');

// @route   GET /api/tasks
// @desc    Listar todas as tarefas (todos os usuários podem ver)
// @access  Private (usuário comum e admin)
router.get('/', authMiddleware, taskController.getAllTasks);

// @route   GET /api/admin/tasks
// @desc    Listar todas as tarefas (Admin Only)
// @access  Private (Admin)
router.get('/admin', authMiddleware, adminAuthMiddleware, taskController.getAllTasks);

// Rota de Teste Temporária - REMOVER DEPOIS
router.get('/test-admin', (req, res) => {
  res.send('Rota de teste /api/tasks/test-admin funcionando!');
});

// @route   POST /api/admin/tasks
// @desc    Adicionar nova tarefa (Admin Only)
// @access  Private (Admin)
router.post('/', authMiddleware, adminAuthMiddleware, taskController.addTask);
router.post('', authMiddleware, adminAuthMiddleware, taskController.addTask);

// @route   DELETE /api/admin/tasks/:id
// @desc    Excluir tarefa (Admin Only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, adminAuthMiddleware, taskController.deleteTask);

// @route   PUT /api/admin/tasks/:id
// @desc    Editar tarefa (Admin Only)
// @access  Private (Admin)
router.put('/:id', authMiddleware, adminAuthMiddleware, taskController.updateTask);

module.exports = router;