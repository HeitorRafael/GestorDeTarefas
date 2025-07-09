// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  // Obter o token do cabeçalho da requisição
  const token = req.header('x-auth-token');