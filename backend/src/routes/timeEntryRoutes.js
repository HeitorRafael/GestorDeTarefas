// backend/src/routes/timeEntryRoutes.js
const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeEntryController');
const authMiddleware = require('../middleware/auth'); // Necessário para todas as rotas de time-entry

// @route   POST /api/time-entries/start
// @desc    Iniciar registro de tempo
// @access  Private (Usuário Comum)
router.post('/start', authMiddleware, timeEntryController.startTimeEntry);

// @route   PUT /api/time-entries/end/:id
// @desc    Finalizar registro de tempo
// @access  Private (Usuário Comum)
router.put('/end/:id', authMiddleware, timeEntryController.endTimeEntry);

// @route   GET /api/time-entries/user/:userId
// @desc    Obter todas as entradas de tempo de um usuário (Admin pode ver qualquer um, comum só o seu)
// @access  Private (Usuário Comum/Admin)
router.get('/user/:userId', authMiddleware, timeEntryController.getUserTimeEntries);

// @route   GET /api/time-entries/user/:userId/monthly-summary
// @desc    Obter resumo mensal de tempo gasto por tarefa e cliente para um usuário
// @access  Private (Usuário Comum/Admin)
router.get('/user/:userId/monthly-summary', authMiddleware, timeEntryController.getMonthlyTimeSummary);

// @route   GET /api/time-entries/user/:userId/weekly-summary
// @desc    Obter resumo semanal de tempo gasto por tarefa e cliente para um usuário
// @access  Private (Usuário Comum/Admin)
router.get('/user/:userId/weekly-summary', authMiddleware, timeEntryController.getWeeklyTimeSummary);

// @route   GET /api/time-entries/active
// @desc    Buscar tarefa ativa do usuário
// @access  Private (Usuário Comum)
router.get('/active', authMiddleware, timeEntryController.getActiveEntry);

// @route   DELETE /api/time-entries/active
// @desc    Cancelar (deletar) a entrada de tempo ativa do usuário
// @access  Private (Usuário Comum)
router.delete('/active', authMiddleware, timeEntryController.cancelActiveEntry);

// @route   GET /api/time-entries/notes-report
// @desc    Obter relatório de anotações com filtros
// @access  Private (Usuário Comum/Admin)
router.get('/notes-report', authMiddleware, timeEntryController.getNotesReport);

// @route   PUT /api/time-entries/:id/notes
// @desc    Atualizar anotações de uma entrada finalizada
// @access  Private (Usuário Comum)
router.put('/:id/notes', authMiddleware, timeEntryController.updateTimeEntryNotes);

// @route   PUT /api/time-entries/:id
// @desc    Editar entrada de tempo completa (Admin ou dono da entrada)
// @access  Private (Admin ou usuário dono)
router.put('/:id', authMiddleware, timeEntryController.updateTimeEntry);

// @route   DELETE /api/time-entries/:id
// @desc    Excluir entrada de tempo (Admin ou dono da entrada)
// @access  Private (Admin ou usuário dono)
router.delete('/:id', authMiddleware, timeEntryController.deleteTimeEntry);

module.exports = router;