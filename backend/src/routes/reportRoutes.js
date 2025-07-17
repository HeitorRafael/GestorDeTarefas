// backend/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth'); // Necessário para todas as rotas de relatório

// @route   GET /api/reports/summary
// @desc    Relatório de resumo de tempo com base nos filtros
// @access  Private (Usuário Comum/Admin)
router.get('/summary', authMiddleware, reportController.getTimeSummaryReport);

// @route   GET /api/reports/daily/:userId?
// @desc    Tempo gasto por tarefa no dia (para um usuário ou todos se admin)
// @access  Private (Usuário Comum/Admin)
router.get('/daily', authMiddleware, reportController.getDailyTaskReport); // usa query param ?userId=X

// @route   GET /api/reports/weekly/:userId?
// @desc    Tempo gasto por tarefa na semana (para um usuário ou todos se admin)
// @access  Private (Usuário Comum/Admin)
router.get('/weekly', authMiddleware, reportController.getWeeklyTaskReport); // usa query param ?userId=X

// @route   GET /api/reports/client-demand/:userId?
// @desc    Clientes que mais demandam tempo (para um usuário ou todos se admin)
// @access  Private (Usuário Comum/Admin)
router.get('/client-demand', authMiddleware, reportController.getClientDemandReport); // usa query param ?userId=X

// @route   GET /api/reports/task-demand/:userId?
// @desc    Tarefas que mais demandam tempo (para um usuário ou todos se admin)
// @access  Private (Usuário Comum/Admin)
router.get('/task-demand', authMiddleware, reportController.getTaskDemandReport); // usa query param ?userId=X

// @route   GET /api/reports/task-by-client/:userId?
// @desc    Tempo gasto em cada tarefa por cliente (para um usuário ou todos se admin)
// @access  Private (Usuário Comum/Admin)
router.get('/task-by-client', authMiddleware, reportController.getTaskByClientReport); // usa query param ?userId=X

module.exports = router;
