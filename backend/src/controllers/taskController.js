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
    // Primeiro, verifique se uma tarefa com o mesmo nome já existe
    const { rows } = await pool.query('SELECT * FROM Tasks WHERE name = $1', [name]);

    if (rows.length > 0) {
      return res.status(400).json({ msg: 'Tarefa com este nome já existe.' });
    }

    // Se não existir, insira a nova tarefa
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
    // Primeiro, verificar quantos time entries serão deletados
    const { rows: timeEntries } = await pool.query(
      'SELECT COUNT(*) as count FROM TimeEntries WHERE taskId = $1',
      [id]
    );
    
    // Verificar se a tarefa existe
    const { rows: taskCheck } = await pool.query('SELECT name FROM Tasks WHERE id = $1', [id]);
    if (taskCheck.length === 0) {
      return res.status(404).json({ msg: 'Tarefa não encontrada.' });
    }

    const { rowCount } = await pool.query('DELETE FROM Tasks WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Tarefa não encontrada.' });
    }

    const deletedEntriesCount = parseInt(timeEntries[0].count);
    const message = `Tarefa "${taskCheck[0].name}" excluída com sucesso.${deletedEntriesCount > 0 ? ` ${deletedEntriesCount} registro(s) de tempo associado(s) também foram removidos.` : ''}`;

    res.json({ msg: message, deletedTimeEntries: deletedEntriesCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao excluir tarefa.');
  }
};

// Editar tarefa (Admin Only)
exports.updateTask = async (req, res) => {
  const pool = getPool();
  const { id } = req.params;
  const { name } = req.body;

  try {
    // Verificar se a tarefa existe
    const { rows: taskCheck } = await pool.query('SELECT name FROM Tasks WHERE id = $1', [id]);
    if (taskCheck.length === 0) {
      return res.status(404).json({ msg: 'Tarefa não encontrada.' });
    }

    // Verificar se já existe outra tarefa com o mesmo nome
    const { rows: duplicateCheck } = await pool.query(
      'SELECT id FROM Tasks WHERE name = $1 AND id != $2', 
      [name, id]
    );
    if (duplicateCheck.length > 0) {
      return res.status(400).json({ msg: 'Já existe uma tarefa com este nome.' });
    }

    // Atualizar a tarefa
    const { rowCount } = await pool.query(
      'UPDATE Tasks SET name = $1 WHERE id = $2',
      [name, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Tarefa não encontrada.' });
    }

    // Buscar a tarefa atualizada
    const { rows: updatedTask } = await pool.query('SELECT * FROM Tasks WHERE id = $1', [id]);

    res.json({ 
      msg: `Tarefa "${taskCheck[0].name}" atualizada para "${name}" com sucesso!`, 
      task: updatedTask[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao atualizar tarefa.');
  }
};