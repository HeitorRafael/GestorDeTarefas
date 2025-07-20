// backend/src/controllers/adminController.js
const { resetDatabase } = require('../config/initDb');
const getPool = require('../config/db');

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

// Exportar dados para backup (Admin Only)
exports.exportData = async (req, res) => {
  const pool = getPool();
  try {
    // Buscar todos os dados das tabelas principais
    const { rows: users } = await pool.query('SELECT id, username, role FROM users ORDER BY id');
    const { rows: clients } = await pool.query('SELECT * FROM clients ORDER BY id');
    const { rows: tasks } = await pool.query('SELECT * FROM tasks ORDER BY id');
    const { rows: timeEntries } = await pool.query(`
      SELECT te.*, u.username, t.name as taskName, c.name as clientName
      FROM timeentries te
      JOIN users u ON te.userid = u.id
      JOIN tasks t ON te.taskid = t.id
      JOIN clients c ON te.clientid = c.id
      ORDER BY te.id
    `);

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        users,
        clients,
        tasks,
        timeEntries
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (err) {
    console.error('Erro ao exportar dados:', err.message);
    res.status(500).json({ 
      msg: 'Erro no servidor ao exportar dados.',
      error: err.message 
    });
  }
};

// Obter configurações do sistema (Admin Only)
exports.getSystemSettings = async (req, res) => {
  const pool = getPool();
  try {
    // Buscar configurações da tabela Settings (se existir) ou retornar padrões
    let settings = {
      systemName: 'Sistema de Gestão de Tempo',
      companyName: 'Sua Empresa',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      workingHoursPerDay: 8,
      workingDaysPerWeek: 5,
      allowEditTimeEntries: true,
      requireNotesForTimeEntries: false
    };

    // Tentar buscar configurações personalizadas (se a tabela existir)
    try {
      const { rows } = await pool.query('SELECT * FROM Settings LIMIT 1');
      if (rows.length > 0) {
        settings = { ...settings, ...rows[0] };
      }
    } catch (err) {
      // Tabela Settings não existe, usar configurações padrão
      console.log('Tabela Settings não encontrada, usando configurações padrão');
    }

    res.json({ settings });
  } catch (err) {
    console.error('Erro ao buscar configurações:', err.message);
    res.status(500).json({ 
      msg: 'Erro no servidor ao buscar configurações.',
      error: err.message 
    });
  }
};

// Atualizar configurações do sistema (Admin Only)
exports.updateSystemSettings = async (req, res) => {
  const pool = getPool();
  const newSettings = req.body;

  try {
    // Criar tabela Settings se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Settings (
        id SERIAL PRIMARY KEY,
        systemName VARCHAR(255),
        companyName VARCHAR(255),
        timezone VARCHAR(100),
        currency VARCHAR(10),
        workingHoursPerDay INTEGER,
        workingDaysPerWeek INTEGER,
        allowEditTimeEntries BOOLEAN,
        requireNotesForTimeEntries BOOLEAN,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verificar se já existe uma configuração
    const { rows: existing } = await pool.query('SELECT id FROM Settings LIMIT 1');

    if (existing.length > 0) {
      // Atualizar configuração existente
      await pool.query(`
        UPDATE Settings SET 
          systemName = $1,
          companyName = $2,
          timezone = $3,
          currency = $4,
          workingHoursPerDay = $5,
          workingDaysPerWeek = $6,
          allowEditTimeEntries = $7,
          requireNotesForTimeEntries = $8,
          updatedAt = CURRENT_TIMESTAMP
        WHERE id = $9
      `, [
        newSettings.systemName,
        newSettings.companyName,
        newSettings.timezone,
        newSettings.currency,
        newSettings.workingHoursPerDay,
        newSettings.workingDaysPerWeek,
        newSettings.allowEditTimeEntries,
        newSettings.requireNotesForTimeEntries,
        existing[0].id
      ]);
    } else {
      // Inserir nova configuração
      await pool.query(`
        INSERT INTO Settings (
          systemName, companyName, timezone, currency,
          workingHoursPerDay, workingDaysPerWeek,
          allowEditTimeEntries, requireNotesForTimeEntries
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        newSettings.systemName,
        newSettings.companyName,
        newSettings.timezone,
        newSettings.currency,
        newSettings.workingHoursPerDay,
        newSettings.workingDaysPerWeek,
        newSettings.allowEditTimeEntries,
        newSettings.requireNotesForTimeEntries
      ]);
    }

    res.json({ msg: 'Configurações atualizadas com sucesso!', settings: newSettings });
  } catch (err) {
    console.error('Erro ao atualizar configurações:', err.message);
    res.status(500).json({ 
      msg: 'Erro no servidor ao atualizar configurações.',
      error: err.message 
    });
  }
};
