// backend/src/controllers/timeEntryController.js
const getPool = require('../config/db');

// Iniciar registro de tempo (Usuário Comum)
exports.startTimeEntry = async (req, res) => {
  const pool = getPool();
  const { taskId, clientId } = req.body;
  const userId = req.user.id; // Obtido do token JWT no middleware de autenticação

  // <<< LOG DE DEBUG
  console.log(`Tentando iniciar tarefa. UserId: ${userId}, TaskId: ${taskId}, ClientId: ${clientId}`);

  try {
    const taskExists = await pool.query('SELECT 1 FROM Tasks WHERE id = $1', [taskId]);
    if (taskExists.rows.length === 0) {
      return res.status(400).json({ msg: 'ID da tarefa inválido.' });
    }
    const clientExists = await pool.query('SELECT 1 FROM Clients WHERE id = $1', [clientId]);
    if (clientExists.rows.length === 0) {
      return res.status(400).json({ msg: 'ID do cliente inválido.' });
    }

    const activeEntry = await pool.query(
      'SELECT * FROM TimeEntries WHERE userId = $1 AND endTime IS NULL',
      [userId]
    );

    if (activeEntry.rows.length > 0) {
      return res.status(400).json({ msg: 'Você já tem uma tarefa em andamento. Finalize-a antes de iniciar uma nova.' });
    }

    const newEntry = await pool.query(
      'INSERT INTO timeentries (userId, taskId, clientId, startTime) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [userId, taskId, clientId]
    );
    res.status(201).json({ msg: 'Registro de tempo iniciado com sucesso!', entry: newEntry.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao iniciar registro de tempo.');
  }
};

// Finalizar registro de tempo (Usuário Comum)
exports.endTimeEntry = async (req, res) => {
  const pool = getPool();
  const { id } = req.params; // ID da entrada de tempo a ser finalizada
  const userId = req.user.id; // Para garantir que o usuário só finalize suas próprias entradas

  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE TimeEntries
       SET endTime = NOW(),
           duration = EXTRACT(EPOCH FROM (NOW() - startTime)) -- Adiciona o cálculo da duração em segundos
       WHERE id = $1 AND userId = $2 AND endTime IS NULL
       RETURNING *`, // Retorna o registro atualizado
      [id, userId]
    );

    if (rowCount === 0) {
      const existingEntry = await pool.query('SELECT * FROM TimeEntries WHERE id = $1', [id]);
      if (existingEntry.rows.length === 0) {
        return res.status(404).json({ msg: 'Registro de tempo não encontrado.' });
      } else if (existingEntry.rows[0].userId !== userId) {
        return res.status(403).json({ msg: 'Você não tem permissão para finalizar este registro.' });
      } else if (existingEntry.rows[0].endTime !== null) {
        return res.status(400).json({ msg: 'Este registro de tempo já foi finalizado.' });
      }
      return res.status(500).json({ msg: 'Não foi possível finalizar o registro de tempo por motivo desconhecido.' });
    }

    res.json({ msg: 'Registro de tempo finalizado com sucesso!', entry: rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao finalizar registro de tempo.');
  }
};

// Obter todas as entradas de tempo de um usuário
exports.getUserTimeEntries = async (req, res) => {
  const pool = getPool();
  const targetUserId = req.params.userId;
  const requestingUserRole = req.user.role;
  const requestingUserId = req.user.id;
  const date = req.query.date; // Obtém a data da query string (YYYY-MM-DD)

  if (requestingUserRole === 'common' && targetUserId !== requestingUserId.toString()) {
    return res.status(403).json({ msg: 'Acesso negado. Usuário comum só pode ver suas próprias entradas.' });
  }

  try {
    let query = `
      SELECT
          te.id,
          te.userId,
          u.username,
          te.taskId,
          t.name AS taskName,
          te.clientId,
          c.name AS clientName,
          te.startTime,
          te.endTime,
          te.duration,
          te.notes
       FROM TimeEntries te
       JOIN Users u ON te.userId = u.id
       JOIN Tasks t ON te.taskId = t.id
       JOIN Clients c ON te.clientId = c.id
       WHERE te.userId = $1
    `;
    const queryParams = [targetUserId];

    if (date) {
      query += ` AND DATE(te.startTime) = $2`;
      queryParams.push(date);
    }

    query += ` ORDER BY te.startTime DESC`;

    const { rows } = await pool.query(query, queryParams);

    res.json(rows);
  } catch (err) {
    console.error('Erro no servidor ao obter entradas de tempo do usuário.', err.message);
    res.status(500).send('Erro no servidor ao obter entradas de tempo do usuário.');
  }
};

// Cancelar/deletar uma entrada de tempo ativa (em andamento)
exports.cancelActiveEntry = async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;

  try {
    // Encontra a entrada ativa (sem endTime)
    const activeEntry = await pool.query(
      'SELECT id FROM TimeEntries WHERE userId = $1 AND endTime IS NULL',
      [userId]
    );

    if (activeEntry.rows.length === 0) {
      return res.status(404).json({ msg: 'Nenhuma tarefa em andamento para cancelar.' });
    }

    const entryId = activeEntry.rows[0].id;

    // Deleta a entrada
    await pool.query('DELETE FROM TimeEntries WHERE id = $1', [entryId]);

    res.json({ msg: 'A tarefa em andamento foi cancelada com sucesso.' });
  } catch (err) {
    console.error('Erro ao cancelar a tarefa:', err.message);
    res.status(500).send('Erro no servidor ao cancelar a tarefa.');
  }
};

// Obter resumo mensal de tempo gasto por tarefa e cliente
exports.getMonthlyTimeSummary = async (req, res) => {
  const pool = getPool();
  const targetUserId = req.params.userId;
  const requestingUserRole = req.user.role;
  const requestingUserId = req.user.id;
  const { month, year, clientId } = req.query; // Mês, Ano e Cliente da query string

  console.log(`[Monthly Summary] Received: month=${month}, year=${year}, clientId=${clientId}`);

  // Validação de acesso
  if (requestingUserRole === 'common' && targetUserId !== requestingUserId.toString()) {
    return res.status(403).json({ msg: 'Acesso negado. Usuário comum só pode ver seus próprios resumos.' });
  }

  // Validação de entrada para mês e ano
  if (!month || !year || isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2000 || year > 2100) {
    return res.status(400).json({ msg: 'Mês e ano válidos são obrigatórios (ex: ?month=7&year=2023).' });
  }

  try {
    let query = `
      SELECT
          t.name AS taskName,
          SUM(COALESCE(te.duration, 0)) AS totalDuration
       FROM TimeEntries te
       JOIN Tasks t ON te.taskId = t.id
       WHERE te.userId = $1
         AND EXTRACT(MONTH FROM te.startTime) = $2
         AND EXTRACT(YEAR FROM te.startTime) = $3
    `;
    const queryParams = [targetUserId, parseInt(month), parseInt(year)];
    let paramIndex = 4;

    if (clientId) {
      query += ` AND te.clientId = ${paramIndex}`;
      queryParams.push(clientId);
      paramIndex++;
    }

    query += ` GROUP BY t.name ORDER BY t.name`;

    console.log(`[Monthly Summary] Executing query: ${query}`);
    console.log(`[Monthly Summary] Query params: ${JSON.stringify(queryParams)}`);
    const { rows } = await pool.query(query, queryParams);
    console.log(`[Monthly Summary] Query result rows: ${JSON.stringify(rows)}`);

    res.json(rows);
  } catch (err) {
    console.error('Erro no servidor ao obter resumo mensal de tempo:', err.message);
    res.status(500).send('Erro no servidor ao obter resumo mensal de tempo.');
  }
};

// Obter resumo semanal de tempo gasto por tarefa e cliente
exports.getWeeklyTimeSummary = async (req, res) => {
  const pool = getPool();
  const targetUserId = req.params.userId;
  const requestingUserRole = req.user.role;
  const requestingUserId = req.user.id;
  const { week, year, clientId } = req.query; // Semana, Ano e Cliente da query string

  console.log(`[Weekly Summary] Received: week=${week}, year=${year}, clientId=${clientId}`);

  // Validação de acesso
  if (requestingUserRole === 'common' && targetUserId !== requestingUserId.toString()) {
    return res.status(403).json({ msg: 'Acesso negado. Usuário comum só pode ver seus próprios resumos.' });
  }

  // Validação de entrada para semana e ano
  if (!week || !year || isNaN(week) || isNaN(year) || week < 1 || week > 53 || year < 2000 || year > 2100) {
    return res.status(400).json({ msg: 'Semana e ano válidos são obrigatórios (ex: ?week=1&year=2023).' });
  }

  try {
    let query = `
      SELECT
          t.name AS taskName,
          SUM(COALESCE(te.duration, 0)) AS totalDuration
       FROM TimeEntries te
       JOIN Tasks t ON te.taskId = t.id
       WHERE te.userId = $1
         AND EXTRACT(WEEK FROM te.startTime) = $2
         AND EXTRACT(YEAR FROM te.startTime) = $3
    `;
    const queryParams = [targetUserId, parseInt(week), parseInt(year)];
    let paramIndex = 4;

    if (clientId) {
      query += ` AND te.clientId = ${paramIndex}`;
      queryParams.push(clientId);
      paramIndex++;
    }

    query += ` GROUP BY t.name ORDER BY t.name`;

    console.log(`[Weekly Summary] Executing query: ${query}`);
    console.log(`[Weekly Summary] Query params: ${JSON.stringify(queryParams)}`);
    const { rows } = await pool.query(query, queryParams);
    console.log(`[Weekly Summary] Query result rows: ${JSON.stringify(rows)}`);

    res.json(rows);
  } catch (err) {
    console.error('Erro no servidor ao obter resumo semanal de tempo:', err.message);
    res.status(500).send('Erro no servidor ao obter resumo semanal de tempo.');
  }
};

// Buscar tarefa ativa do usuário
exports.getActiveEntry = async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;

  try {
    const activeEntry = await pool.query(`
      SELECT 
        te.*,
        t.name as task_name,
        c.name as client_name
      FROM TimeEntries te
      JOIN Tasks t ON te.taskId = t.id
      JOIN Clients c ON te.clientId = c.id
      WHERE te.userId = $1 AND te.endTime IS NULL
      ORDER BY te.startTime DESC
      LIMIT 1
    `, [userId]);

    if (activeEntry.rows.length === 0) {
      return res.status(404).json({ msg: 'Nenhuma tarefa ativa encontrada.' });
    }

    res.json(activeEntry.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar tarefa ativa:', err.message);
    res.status(500).send('Erro no servidor ao buscar tarefa ativa.');
  }
};

// Buscar anotações com filtros para dashboard
exports.getNotesReport = async (req, res) => {
  const pool = getPool();
  const { month, year, clientId, week, userId: targetUserId } = req.query;
  const requestingUserRole = req.user.role;
  const requestingUserId = req.user.id;

  // Determinar qual userId usar
  let effectiveUserId;
  let includeAllUsers = false;
  
  if (requestingUserRole === 'admin') {
    if (targetUserId && targetUserId !== '') {
      // Admin solicitou usuário específico
      effectiveUserId = targetUserId;
    } else {
      // Admin sem usuário específico = todos os usuários
      includeAllUsers = true;
    }
  } else {
    // Usuário comum sempre vê apenas seus próprios dados
    effectiveUserId = requestingUserId;
  }

  try {
    const queryParams = [];
    const whereClauses = [];

    // Filtro de usuário apenas se não for "todos os usuários"
    if (!includeAllUsers) {
      queryParams.push(effectiveUserId);
      whereClauses.push(`te.userId = $${queryParams.length}`);
    }

    if (month && year) {
      queryParams.push(parseInt(month));
      whereClauses.push(`EXTRACT(MONTH FROM te.startTime) = $${queryParams.length}`);
      queryParams.push(parseInt(year));
      whereClauses.push(`EXTRACT(YEAR FROM te.startTime) = $${queryParams.length}`);
    } else if (week && year) {
      queryParams.push(parseInt(week));
      whereClauses.push(`EXTRACT(WEEK FROM te.startTime) = $${queryParams.length}`);
      queryParams.push(parseInt(year));
      whereClauses.push(`EXTRACT(YEAR FROM te.startTime) = $${queryParams.length}`);
    }

    // Verificar se clientId é válido (não vazio e não nulo)
    if (clientId && clientId.trim() !== '') {
      queryParams.push(parseInt(clientId));
      whereClauses.push(`te.clientId = $${queryParams.length}`);
    }

    // Apenas entradas que têm anotações
    whereClauses.push(`te.notes IS NOT NULL AND te.notes != ''`);

    // Construir WHERE clause
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT
          te.id,
          te.notes,
          te.startTime,
          te.endTime,
          te.duration,
          u.username,
          t.name AS taskName,
          c.name AS clientName
      FROM TimeEntries te
      JOIN Users u ON te.userId = u.id
      JOIN Tasks t ON te.taskId = t.id
      JOIN Clients c ON te.clientId = c.id
      ${whereClause}
      ORDER BY te.startTime DESC;
    `;

    const { rows } = await pool.query(query, queryParams);

    res.json(rows);
  } catch (err) {
    console.error('Erro no getNotesReport:', err.message);
    res.status(500).json({ 
      msg: 'Erro no servidor ao gerar relatório de anotações.',
      error: err.message 
    });
  }
};

// Atualizar anotações de uma entrada finalizada
exports.updateTimeEntryNotes = async (req, res) => {
  const pool = getPool();
  const { id } = req.params;
  const { notes } = req.body;
  const userId = req.user.id;

  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE TimeEntries
       SET notes = $1
       WHERE id = $2 AND userId = $3 AND endTime IS NOT NULL
       RETURNING *`,
      [notes, id, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Registro de tempo não encontrado ou não finalizado.' });
    }

    res.json({ msg: 'Anotações atualizadas com sucesso!', entry: rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar anotações:', err.message);
    res.status(500).send('Erro no servidor ao atualizar anotações.');
  }
};

// Editar entrada de tempo completa (Admin ou dono da entrada)
exports.updateTimeEntry = async (req, res) => {
  const pool = getPool();
  const { id } = req.params;
  const { taskId, clientId, startTime, endTime, notes } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Verificar se a entrada existe e se o usuário tem permissão
    const { rows: entryCheck } = await pool.query('SELECT userId FROM TimeEntries WHERE id = $1', [id]);
    if (entryCheck.length === 0) {
      return res.status(404).json({ msg: 'Registro de tempo não encontrado.' });
    }

    // Verificar permissão (admin pode editar qualquer um, comum só o próprio)
    if (userRole !== 'admin' && entryCheck[0].userid !== userId) {
      return res.status(403).json({ msg: 'Você não tem permissão para editar este registro.' });
    }

    // Validar se as datas são válidas
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    
    if (end && start >= end) {
      return res.status(400).json({ msg: 'A data de fim deve ser posterior à data de início.' });
    }

    // Calcular duração se endTime for fornecido
    let duration = null;
    if (end) {
      duration = Math.floor((end - start) / 1000); // duração em segundos
    }

    // Atualizar a entrada
    const { rowCount, rows } = await pool.query(
      `UPDATE TimeEntries
       SET taskId = $1, clientId = $2, startTime = $3, endTime = $4, duration = $5, notes = $6
       WHERE id = $7
       RETURNING *`,
      [taskId, clientId, startTime, endTime, duration, notes, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Erro ao atualizar registro de tempo.' });
    }

    res.json({ msg: 'Registro de tempo atualizado com sucesso!', entry: rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar entrada de tempo:', err.message);
    res.status(500).send('Erro no servidor ao atualizar entrada de tempo.');
  }
};

// Excluir entrada de tempo (Admin ou dono da entrada)
exports.deleteTimeEntry = async (req, res) => {
  const pool = getPool();
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Verificar se a entrada existe e obter dados para permissão
    const { rows: entryCheck } = await pool.query(
      `SELECT te.userId, t.name as taskName, c.name as clientName 
       FROM TimeEntries te
       JOIN Tasks t ON te.taskId = t.id
       JOIN Clients c ON te.clientId = c.id
       WHERE te.id = $1`, 
      [id]
    );
    
    if (entryCheck.length === 0) {
      return res.status(404).json({ msg: 'Registro de tempo não encontrado.' });
    }

    // Verificar permissão (admin pode deletar qualquer um, comum só o próprio)
    if (userRole !== 'admin' && entryCheck[0].userid !== userId) {
      return res.status(403).json({ msg: 'Você não tem permissão para excluir este registro.' });
    }

    // Excluir a entrada
    const { rowCount } = await pool.query('DELETE FROM TimeEntries WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ msg: 'Erro ao excluir registro de tempo.' });
    }

    res.json({ 
      msg: `Registro de tempo (${entryCheck[0].taskname} - ${entryCheck[0].clientname}) excluído com sucesso!`
    });
  } catch (err) {
    console.error('Erro ao excluir entrada de tempo:', err.message);
    res.status(500).send('Erro no servidor ao excluir entrada de tempo.');
  }
};