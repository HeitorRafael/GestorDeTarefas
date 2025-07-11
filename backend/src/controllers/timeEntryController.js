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
          te.duration
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
  const { month, year } = req.query; // Mês e Ano da query string

  // Validação de acesso
  if (requestingUserRole === 'common' && targetUserId !== requestingUserId.toString()) {
    return res.status(403).json({ msg: 'Acesso negado. Usuário comum só pode ver seus próprios resumos.' });
  }

  // Validação de entrada para mês e ano
  if (!month || !year || isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2000 || year > 2100) {
    return res.status(400).json({ msg: 'Mês e ano válidos são obrigatórios (ex: ?month=7&year=2023).' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
          c.name AS clientName,
          t.name AS taskName,
          SUM(te.duration) AS totalDuration
       FROM TimeEntries te
       JOIN Clients c ON te.clientId = c.id
       JOIN Tasks t ON te.taskId = t.id
       WHERE te.userId = $1
         AND EXTRACT(MONTH FROM te.startTime) = $2
         AND EXTRACT(YEAR FROM te.startTime) = $3
       GROUP BY c.name, t.name
       ORDER BY c.name, t.name`,
      [targetUserId, parseInt(month), parseInt(year)]
    );

    res.json(rows);
  } catch (err) {
    console.error('Erro no servidor ao obter resumo mensal de tempo:', err.message);
    res.status(500).send('Erro no servidor ao obter resumo mensal de tempo.');
  }
};