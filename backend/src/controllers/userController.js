// backend/src/controllers/userController.js
const bcrypt = require('bcryptjs');
const getPool = require('../config/db');

// Cadastrar novo usuário (Admin Only)
exports.registerUser = async (req, res) => {
  const pool = getPool();
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
  const pool = getPool();
  const { id } = req.params; // ID do usuário a ser excluído

  try {
    // Primeiro, verificar quantos time entries serão deletados
    const { rows: timeEntries } = await pool.query(
      'SELECT COUNT(*) as count FROM TimeEntries WHERE userId = $1',
      [id]
    );
    
    // Verificar se o usuário existe
    const { rows: userCheck } = await pool.query('SELECT username FROM Users WHERE id = $1', [id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    const { rowCount } = await pool.query('DELETE FROM Users WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    const deletedEntriesCount = parseInt(timeEntries[0].count);
    const message = `Usuário "${userCheck[0].username}" excluído com sucesso.${deletedEntriesCount > 0 ? ` ${deletedEntriesCount} registro(s) de tempo associado(s) também foram removidos.` : ''}`;

    res.json({ msg: message, deletedTimeEntries: deletedEntriesCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao excluir usuário.');
  }
};

// Listar todos os usuários (Admin Only)
exports.getAllUsers = async (req, res) => {
  const pool = getPool();
  try {
    const { rows } = await pool.query('SELECT id, username, role FROM Users ORDER BY username ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao listar usuários.');
  }
};

// Alterar senha do próprio usuário
exports.changePassword = async (req, res) => {
  const pool = getPool();
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // Do middleware de auth

  try {
    // 1. Verificar senha atual
    const { rows } = await pool.query('SELECT password FROM Users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Senha atual incorreta.' });
    }

    // 2. Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Atualizar senha
    await pool.query('UPDATE Users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ msg: 'Senha alterada com sucesso!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao alterar senha.');
  }
};

// Admin resetar senha de qualquer usuário
exports.resetUserPassword = async (req, res) => {
  const pool = getPool();
  const { newPassword } = req.body;
  const { id: targetUserId } = req.params;

  try {
    // Verificar se o usuário alvo existe
    const { rows } = await pool.query('SELECT username FROM Users WHERE id = $1', [targetUserId]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualizar senha
    await pool.query('UPDATE Users SET password = $1 WHERE id = $2', [hashedPassword, targetUserId]);

    res.json({ 
      msg: `Senha do usuário "${rows[0].username}" resetada com sucesso pelo admin!` 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao resetar senha.');
  }
};

// Obter perfil do usuário logado
exports.getUserProfile = async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      'SELECT id, username, role FROM Users WHERE id = $1', 
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao obter perfil.');
  }
};

// Atualizar perfil do usuário logado (exceto senha)
exports.updateUserProfile = async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;
  const { username } = req.body; // Por enquanto só username, pode expandir

  try {
    // Verificar se o novo username já existe (se foi alterado)
    const { rows: currentUser } = await pool.query('SELECT username FROM Users WHERE id = $1', [userId]);
    if (currentUser.length === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    // Se o username mudou, verificar se não há conflito
    if (username !== currentUser[0].username) {
      const { rows: duplicateCheck } = await pool.query(
        'SELECT id FROM Users WHERE username = $1 AND id != $2', 
        [username, userId]
      );
      if (duplicateCheck.length > 0) {
        return res.status(400).json({ msg: 'Este nome de usuário já está em uso.' });
      }
    }

    // Atualizar o perfil
    const { rowCount } = await pool.query(
      'UPDATE Users SET username = $1 WHERE id = $2',
      [username, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    // Retornar dados atualizados
    const { rows: updatedUser } = await pool.query(
      'SELECT id, username, role FROM Users WHERE id = $1', 
      [userId]
    );

    res.json({ 
      msg: 'Perfil atualizado com sucesso!', 
      user: updatedUser[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao atualizar perfil.');
  }
};