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
  const { month, year, clientId, week } = req.query;
  const userId = req.user.id;

  try {
    let query = `
      SELECT
          t.name AS taskName,
          COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(te.endTime, NOW()) - te.startTime))), 0) AS totalDuration
      FROM TimeEntries te
      JOIN Tasks t ON te.taskId = t.id
      WHERE te.userId = $1
    `;

    const queryParams = [userId];

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM te.startTime) = ${queryParams.length + 1}`;
      queryParams.push(month);
      query += ` AND EXTRACT(YEAR FROM te.startTime) = ${queryParams.length + 1}`;
      queryParams.push(year);
    } else if (week && year) {
      query += ` AND EXTRACT(WEEK FROM te.startTime) = ${queryParams.length + 1}`;
      queryParams.push(week);
      query += ` AND EXTRACT(YEAR FROM te.startTime) = ${queryParams.length + 1}`;
      queryParams.push(year);
    }

    if (clientId) {
      query += ` AND te.clientId = ${queryParams.length + 1}`;
      queryParams.push(clientId);
    }

    query += `
      GROUP BY t.name
      ORDER BY totalDuration DESC;
    `;

    const { rows } = await pool.query(query, queryParams);

    const formattedRows = rows.map(row => ({
      taskname: row.taskname,
      totalDuration: row.totalduration
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao gerar relatório de resumo de tempo.');
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