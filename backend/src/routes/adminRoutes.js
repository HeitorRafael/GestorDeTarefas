// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Rota para resetar o banco de dados (Admin Only)
router.post('/reset-database', auth, adminAuth, adminController.resetDatabase);

// Rota para ver estatísticas do banco (Admin Only)  
router.get('/stats', auth, adminAuth, adminController.getDatabaseStats);

// Rota para backup de dados (Admin Only)
router.get('/backup', auth, adminAuth, adminController.exportData);

// Rota para configurações do sistema (Admin Only)
router.get('/settings', auth, adminAuth, adminController.getSystemSettings);
router.put('/settings', auth, adminAuth, adminController.updateSystemSettings);

module.exports = router;
