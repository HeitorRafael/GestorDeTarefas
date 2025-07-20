// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  // Obter o token do cabeçalho da requisição
  const token = req.header('x-auth-token');

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({ msg: 'Nenhum token, autorização negada.' });
  }

  // Verificar o token
  try {
    const jwtSecret = process.env.JWT_SECRET || 'time_management_jwt_secret_key_2025_base_system';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user; // Adiciona o payload do usuário à requisição
    next(); // Continua para a próxima função middleware/rota
  } catch (err) {
    console.error('Erro de verificação JWT:', err.message);
    res.status(401).json({ msg: 'Token não é válido.' });
  }
};