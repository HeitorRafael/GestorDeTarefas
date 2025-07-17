// backend/src/controllers/adminController.js
const { resetDatabase } = require('../config/initDb');

// Reset do banco de dados (Super Admin Only)
exports.resetDatabase = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Acesso negado. Apenas administradores podem resetar o banco.' });
    }

    await resetDatabase();
    res.json({ 
      msg: 'Banco de dados resetado com sucesso!',
      details: 'Todos os registros de tempo foram removidos. Apenas usuários admin/user1, tarefas e clientes iniciais permanecem.'
    });
  } catch (err) {
    console.error('Erro ao resetar banco:', err.message);
    res.status(500).json({ 
      msg: 'Erro no servidor ao resetar banco de dados.',
      error: err.message 
    });
  }
};

// Estatísticas do banco (Admin Only)
exports.getDatabaseStats = async (req, res) => {
  const getPool = require('../config/db');
  const pool = getPool();

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Acesso negado. Apenas administradores podem ver estatísticas.' });
    }

    const stats = {};
    
    const { rows: userCount } = await pool.query('SELECT COUNT(*) as count FROM Users');
    stats.users = parseInt(userCount[0].count);
    
    const { rows: clientCount } = await pool.query('SELECT COUNT(*) as count FROM Clients');
    stats.clients = parseInt(clientCount[0].count);
    
    const { rows: taskCount } = await pool.query('SELECT COUNT(*) as count FROM Tasks');
    stats.tasks = parseInt(taskCount[0].count);
    
    const { rows: timeEntryCount } = await pool.query('SELECT COUNT(*) as count FROM TimeEntries');
    stats.timeEntries = parseInt(timeEntryCount[0].count);
    
    const { rows: activeEntries } = await pool.query('SELECT COUNT(*) as count FROM TimeEntries WHERE endTime IS NULL');
    stats.activeTimeEntries = parseInt(activeEntries[0].count);

    res.json({
      msg: 'Estatísticas do banco de dados',
      stats
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas:', err.message);
    res.status(500).json({ 
      msg: 'Erro no servidor ao buscar estatísticas.',
      error: err.message 
    });
  }
};
