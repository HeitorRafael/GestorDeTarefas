// backend/src/controllers/clientController.js
const pool = require('../config/db');

// Listar todos os clientes (ordenados alfabeticamente)
exports.getAllClients = async (req, res) => {
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
  const { name } = req.body;

  try {
    // Verificar se o cliente já existe
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
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM Clients WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Cliente não encontrado.' });
    }

    res.json({ msg: 'Cliente excluído com sucesso.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao excluir cliente.');
  }
};