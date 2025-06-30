// backend/src/middleware/adminAuth.js
module.exports = (req, res, next) => {
  // req.user.role foi definido no middleware de autenticação
  if (req.user && req.user.role === 'admin') {
    next(); // Se for admin, continua
  } else {
    res.status(403).json({ msg: 'Acesso negado. Apenas para administradores.' });
  }
};