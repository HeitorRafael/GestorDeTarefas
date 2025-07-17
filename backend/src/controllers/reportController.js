// backend/src/controllers/reportController.js
const getPool = require('../config/db');
const { format } = require('date-fns'); // Usaremos date-fns para manipulação de datas

// Para instalar date-fns: npm install date-fns

// Função auxiliar para obter userId ou undefined se admin e nenhum userId específico for solicitado
const getUserIdFilter = (req) => {
  const requestingUserRole = req.user.role;
  const requestingUserId = req.user.id;
  const targetUserId = req.query.userId; // Ou req.params.userId, dependendo da rota

  // Se for admin e um userId específico for fornecido, usa o userId fornecido
  if (requestingUserRole === 'admin' && targetUserId) {
    return targetUserId;
  }
  // Se for admin e nenhum userId específico for fornecido, retorna undefined para todos os usuários
  else if (requestingUserRole === 'admin' && !targetUserId) {
    return undefined; // Indica que o relatório é para todos os usuários
  }
  // Se for usuário comum, sempre usa o seu próprio userId
  else if (requestingUserRole === 'common') {
    return requestingUserId;
  }
  return undefined; // Fallback, não deveria acontecer
};

// Formata a data para DD/MM/YYYY HH:MM
const formatDateTime = (date) => {
  if (!date) return null;
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

// Formata a duração em HH:MM:SS
const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .map(val => val < 10 ? '0' + val : val)
    .join(':');
};

exports.getTimeSummaryReport = async (req, res) => {
  const pool = getPool();
  const { month, year, clientId, week, userId: targetUserId } = req.query;
  const requestingUserRole = req.user.role;
  const requestingUserId = req.user.id;

  // Determinar qual userId usar
  let effectiveUserId;
  if (requestingUserRole === 'admin' && targetUserId) {
    effectiveUserId = targetUserId;
  } else {
    effectiveUserId = requestingUserId;
  }

  try {
    const queryParams = [effectiveUserId];
    const whereClauses = ["te.userId = $1"];

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

    const query = `
      SELECT
          t.name AS taskname,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.endTime, NOW()) - te.startTime))), 0) AS totalduration
      FROM TimeEntries te
      JOIN Tasks t ON te.taskId = t.id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY t.name
      ORDER BY SUM(EXTRACT(EPOCH FROM (COALESCE(te.endTime, NOW()) - te.startTime))) DESC;
    `;

    const { rows } = await pool.query(query, queryParams);

    const formattedRows = rows.map(row => ({
      taskname: row.taskname,
      totalDuration: Math.round(parseFloat(row.totalduration)) // Converter para inteiro
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error('Erro no getTimeSummaryReport:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
      msg: 'Erro no servidor ao gerar relatório de resumo de tempo.',
      error: err.message 
    });
  }
};


// 1. Tempo gasto por tarefa no dia
exports.getDailyTaskReport = async (req, res) => {
  const pool = getPool();
  const targetUserId = getUserIdFilter(req);
  const { date } = req.query; // Formato esperado: YYYY-MM-DD

  if (!date && targetUserId !== undefined) { // Se não for admin buscando todos, a data é obrigatória
    return res.status(400).json({ msg: 'A data é obrigatória para este relatório ou especifique um userId para admin.' });
  }

  try {
    let query = `
      SELECT
          t.name AS taskName,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.endTime, NOW()) - te.startTime))), 0) AS totalDurationSeconds
      FROM TimeEntries te
      JOIN Tasks t ON te.taskId = t.id
      WHERE DATE_TRUNC('day', te.startTime) = DATE_TRUNC('day', $1::timestamp)
    `;
    const queryParams = [date ? new Date(date) : new Date()]; // Se a data não for fornecida (admin all), usa a data atual

    if (targetUserId !== undefined) { // Se um userId específico for solicitado (admin ou comum)
      query += ` AND te.userId = $${queryParams.length + 1}`;
      queryParams.push(targetUserId);
    }

    query += `
      GROUP BY t.name
      ORDER BY totalDurationSeconds DESC;
    `;

    const { rows } = await pool.query(query, queryParams);

    const formattedRows = rows.map(row => ({
      taskName: row.taskName,
      totalDuration: formatDuration(parseFloat(row.totalDurationSeconds))
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao gerar relatório diário por tarefa.');
  }
};

// 2. Tempo gasto por tarefa na semana
exports.getWeeklyTaskReport = async (req, res) => {
  const pool = getPool();
  const targetUserId = getUserIdFilter(req);
  const { weekNumber, year } = req.query; // Ex: weekNumber=25, year=2024

  if (!weekNumber || !year) {
    return res.status(400).json({ msg: 'O número da semana e o ano são obrigatórios.' });
  }

  try {
    let query = `
      SELECT
          t.name AS taskName,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.endTime, NOW()) - te.startTime))), 0) AS totalDurationSeconds
      FROM TimeEntries te
      JOIN Tasks t ON te.taskId = t.id
      WHERE EXTRACT(WEEK FROM te.startTime) = $1 AND EXTRACT(YEAR FROM te.startTime) = $2
    `;
    const queryParams = [weekNumber, year];

    if (targetUserId !== undefined) {
      query += ` AND te.userId = $${queryParams.length + 1}`;
      queryParams.push(targetUserId);
    }

    query += `
      GROUP BY t.name
      ORDER BY totalDurationSeconds DESC;
    `;

    const { rows } = await pool.query(query, queryParams);

    const formattedRows = rows.map(row => ({
      taskName: row.taskName,
      totalDuration: formatDuration(parseFloat(row.totalDurationSeconds))
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao gerar relatório semanal por tarefa.');
  }
};

// 3. Clientes que mais demandam tempo
exports.getClientDemandReport = async (req, res) => {
  const pool = getPool();
  const targetUserId = getUserIdFilter(req);
  const { startDate, endDate } = req.query; // Formato YYYY-MM-DD

  if ((!startDate || !endDate) && targetUserId !== undefined) {
      return res.status(400).json({ msg: 'Datas de início e fim são obrigatórias para este relatório ou especifique um userId para admin.' });
  }

  try {
    let query = `
      SELECT
          c.name AS clientName,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.endTime, NOW()) - te.startTime))), 0) AS totalDurationSeconds
      FROM TimeEntries te
      JOIN Clients c ON te.clientId = c.id
      WHERE te.startTime >= $1::timestamp AND te.startTime <= $2::timestamp + INTERVAL '1 day' - INTERVAL '1 second'
    `;
    const queryParams = [startDate ? startDate : '2000-01-01', endDate ? endDate : format(new Date(), 'yyyy-MM-dd')]; // Valores padrão amplos se admin buscar todos

    if (targetUserId !== undefined) {
      query += ` AND te.userId = $${queryParams.length + 1}`;
      queryParams.push(targetUserId);
    }

    query += `
      GROUP BY c.name
      ORDER BY totalDurationSeconds DESC;
    `;

    const { rows } = await pool.query(query, queryParams);

    const formattedRows = rows.map(row => ({
      clientName: row.clientName,
      totalDuration: formatDuration(parseFloat(row.totalDurationSeconds))
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao gerar relatório de demanda por cliente.');
  }
};

// 4. Tarefas que mais demandam tempo (geral ou por usuário)
exports.getTaskDemandReport = async (req, res) => {
  const pool = getPool();
  const targetUserId = getUserIdFilter(req);
  const { startDate, endDate } = req.query; // Formato YYYY-MM-DD

  if ((!startDate || !endDate) && targetUserId !== undefined) {
      return res.status(400).json({ msg: 'Datas de início e fim são obrigatórias para este relatório ou especifique um userId para admin.' });
  }

  try {
    let query = `
      SELECT
          t.name AS taskName,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.endTime, NOW()) - te.startTime))), 0) AS totalDurationSeconds
      FROM TimeEntries te
      JOIN Tasks t ON te.taskId = t.id
      WHERE te.startTime >= $1::timestamp AND te.startTime <= $2::timestamp + INTERVAL '1 day' - INTERVAL '1 second'
    `;
    const queryParams = [startDate ? startDate : '2000-01-01', endDate ? endDate : format(new Date(), 'yyyy-MM-dd')];

    if (targetUserId !== undefined) {
      query += ` AND te.userId = $${queryParams.length + 1}`;
      queryParams.push(targetUserId);
    }

    query += `
      GROUP BY t.name
      ORDER BY totalDurationSeconds DESC;
    `;

    const { rows } = await pool.query(query, queryParams);

    const formattedRows = rows.map(row => ({
      taskName: row.taskName,
      totalDuration: formatDuration(parseFloat(row.totalDurationSeconds))
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao gerar relatório de demanda por tarefa.');
  }
};

// 5. Tempo gasto em cada tarefa por cliente
exports.getTaskByClientReport = async (req, res) => {
  const pool = getPool();
  const targetUserId = getUserIdFilter(req);
  const { startDate, endDate } = req.query; // Formato YYYY-MM-DD

  if ((!startDate || !endDate) && targetUserId !== undefined) {
      return res.status(400).json({ msg: 'Datas de início e fim são obrigatórias para este relatório ou especifique um userId para admin.' });
  }

  try {
    let query = `
      SELECT
          c.name AS clientName,
          t.name AS taskName,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.endTime, NOW()) - te.startTime))), 0) AS totalDurationSeconds
      FROM TimeEntries te
      JOIN Clients c ON te.clientId = c.id
      JOIN Tasks t ON te.taskId = t.id
      WHERE te.startTime >= $1::timestamp AND te.startTime <= $2::timestamp + INTERVAL '1 day' - INTERVAL '1 second'
    `;
    const queryParams = [startDate ? startDate : '2000-01-01', endDate ? endDate : format(new Date(), 'yyyy-MM-dd')];

    if (targetUserId !== undefined) {
      query += ` AND te.userId = $${queryParams.length + 1}`;
      queryParams.push(targetUserId);
    }

    query += `
      GROUP BY c.name, t.name
      ORDER BY c.name, totalDurationSeconds DESC;
    `;

    const { rows } = await pool.query(query, queryParams);

    const formattedRows = rows.map(row => ({
      clientName: row.clientName,
      taskName: row.taskName,
      totalDuration: formatDuration(parseFloat(row.totalDurationSeconds))
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao gerar relatório de tarefa por cliente.');
  }
};

// Relatório detalhado com estatísticas (tempo médio, número de entradas)
exports.getDetailedTimeSummaryReport = async (req, res) => {
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

    // Construir WHERE clause
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')} AND te.endTime IS NOT NULL` : 'WHERE te.endTime IS NOT NULL';

    const query = `
      SELECT
          t.name AS taskname,
          COUNT(te.id) AS entry_count,
          COALESCE(SUM(EXTRACT(EPOCH FROM (te.endTime - te.startTime))), 0) AS total_duration,
          COALESCE(AVG(EXTRACT(EPOCH FROM (te.endTime - te.startTime))), 0) AS average_duration
      FROM TimeEntries te
      JOIN Tasks t ON te.taskId = t.id
      ${whereClause}
      GROUP BY t.name
      ORDER BY total_duration DESC;
    `;

    console.log(`Query: ${query}`);
    console.log(`Params: ${JSON.stringify(queryParams)}`);
    console.log(`Include All Users: ${includeAllUsers}`);

    const { rows } = await pool.query(query, queryParams);

    const formattedRows = rows.map(row => ({
      taskname: row.taskname,
      totalDuration: Math.round(parseFloat(row.total_duration)),
      averageDuration: Math.round(parseFloat(row.average_duration)),
      entryCount: parseInt(row.entry_count)
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error('Erro no getDetailedTimeSummaryReport:', err.message);
    res.status(500).json({ 
      msg: 'Erro no servidor ao gerar relatório detalhado de tempo.',
      error: err.message 
    });
  }
};