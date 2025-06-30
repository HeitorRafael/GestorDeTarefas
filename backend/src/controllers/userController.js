// backend/src/controllers/userController.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Cadastrar novo usuário (Admin Only)
exports.registerUser = async (req, res) => {
  const { username, password, role = 'common' } = req.body; // Default role é 'common'

  try {
    // 1. Verificar se o username já existe
    const { rows } = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    if (rows.length > 0) {
      return res.status(400).json({ msg: 'Nome de usuário já existe.' });
    }

    // 2. Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Inserir o novo usuário no banco de dados
    const newUser = await pool.query(
      'INSERT INTO Users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role]
    );

    res.status(201).json({ msg: 'Usuário cadastrado com sucesso!', user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao cadastrar usuário.');
  }
};

// Excluir usuário (Admin Only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params; // ID do usuário a ser excluído

  try {
    const { rowCount } = await pool.query('DELETE FROM Users WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    res.json({ msg: 'Usuário excluído com sucesso.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao excluir usuário.');
  }
};