// backend/src/controllers/clientController.js
const getPool = require('../config/db');

// Listar todos os clientes (ordenados alfabeticamente)
exports.getAllClients = async (req, res) => {
  const pool = getPool();
  try {
    const { rows } = await pool.query('SELECT * FROM Clients ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao listar clientes.');
  }
};

// Adicionar novo cliente (Admin Only)
exports.addClient = async (req, res) => {
  const pool = getPool();
  const { name } = req.body;

  try {
    // Verificar se um cliente com o mesmo nome já existe
    const { rows } = await pool.query('SELECT * FROM Clients WHERE name = $1', [name]);
    
    if (rows.length > 0) {
      return res.status(400).json({ msg: 'Cliente com este nome já existe.' });
    }

    const newClient = await pool.query(
      'INSERT INTO Clients (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json({ msg: 'Cliente adicionado com sucesso!', client: newClient.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao adicionar cliente.');
  }
};

// Excluir cliente (Admin Only)
exports.deleteClient = async (req, res) => {
  const pool = getPool();
  const { id } = req.params;

  try {
    // Primeiro, verificar quantos time entries serão deletados
    const { rows: timeEntries } = await pool.query(
      'SELECT COUNT(*) as count FROM TimeEntries WHERE clientId = $1',
      [id]
    );
    
    // Verificar se o cliente existe
    const { rows: clientCheck } = await pool.query('SELECT name FROM Clients WHERE id = $1', [id]);
    if (clientCheck.length === 0) {
      return res.status(404).json({ msg: 'Cliente não encontrado.' });
    }

    const { rowCount } = await pool.query('DELETE FROM Clients WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Cliente não encontrado.' });
    }

    const deletedEntriesCount = parseInt(timeEntries[0].count);
    const message = `Cliente "${clientCheck[0].name}" excluído com sucesso.${deletedEntriesCount > 0 ? ` ${deletedEntriesCount} registro(s) de tempo associado(s) também foram removidos.` : ''}`;

    res.json({ msg: message, deletedTimeEntries: deletedEntriesCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao excluir cliente.');
  }
};

// Editar cliente (Admin Only)
exports.updateClient = async (req, res) => {
  const pool = getPool();
  const { id } = req.params;
  const { name } = req.body;

  try {
    // Verificar se o cliente existe
    const { rows: clientCheck } = await pool.query('SELECT name FROM Clients WHERE id = $1', [id]);
    if (clientCheck.length === 0) {
      return res.status(404).json({ msg: 'Cliente não encontrado.' });
    }

    // Verificar se já existe outro cliente com o mesmo nome
    const { rows: duplicateCheck } = await pool.query(
      'SELECT id FROM Clients WHERE name = $1 AND id != $2', 
      [name, id]
    );
    if (duplicateCheck.length > 0) {
      return res.status(400).json({ msg: 'Já existe um cliente com este nome.' });
    }

    // Atualizar o cliente
    const { rowCount } = await pool.query(
      'UPDATE Clients SET name = $1 WHERE id = $2',
      [name, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Cliente não encontrado.' });
    }

    // Buscar o cliente atualizado
    const { rows: updatedClient } = await pool.query('SELECT * FROM Clients WHERE id = $1', [id]);

    res.json({ 
      msg: `Cliente "${clientCheck[0].name}" atualizado para "${name}" com sucesso!`, 
      client: updatedClient[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao atualizar cliente.');
  }
};