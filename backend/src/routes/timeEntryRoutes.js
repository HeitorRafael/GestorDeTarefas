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

module.exports = router;