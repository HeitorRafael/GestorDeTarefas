// backend/src/controllers/taskController.js
const getPool = require('../config/db');

// Listar todas as tarefas
exports.getAllTasks = async (req, res) => {
  const pool = getPool();
  try {
    const { rows } = await pool.query('SELECT * FROM Tasks ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao listar tarefas.');
  }
};

// Adicionar nova tarefa (Admin Only)
exports.addTask = async (req, res) => {
  const pool = getPool();
  const { name } = req.body;

  try {
    if (rows.length > 0) {
      return res.status(400).json({ msg: 'Tarefa com este nome já existe.' });
    }

    const newTask = await pool.query(
      'INSERT INTO Tasks (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ msg: 'Tarefa adicionada com sucesso!', task: newTask.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao adicionar tarefa.');
  }
};

// Excluir tarefa (Admin Only)
exports.deleteTask = async (req, res) => {
  const pool = getPool();
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM Tasks WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Tarefa não encontrada.' });
    }

    res.json({ msg: 'Tarefa excluída com sucesso.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao excluir tarefa.');
  }
};