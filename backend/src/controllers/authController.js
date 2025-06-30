// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Verificar se o usuário existe
    const { rows } = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    const user = rows[0];

    // 2. Comparar a senha fornecida com a senha hashed no banco de dados
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // 3. Gerar e retornar o token JWT
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expira em 1 hora
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor.');
  }
};