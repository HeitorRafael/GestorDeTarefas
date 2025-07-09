// backend/src/app.js
require('dotenv').config();
console.log('DB_DATABASE (app.js, after dotenv): ', process.env.DB_DATABASE);
const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./config/initDb');

// Importar todas as rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const clientRoutes = require('./routes/clientRoutes');
const timeEntryRoutes = require('./routes/timeEntryRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Certifique-se que esta linha está presente

// Declare e inicialize 'app' AQUI.
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializa o banco de dados antes de iniciar o servidor
initializeDatabase().then(() => {
  // Definir Rotas
  app.use('/api/auth', authRoutes);
  app.use('/api/admin/users', userRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/time-entries', timeEntryRoutes);
  app.use('/api/reports', reportRoutes); // Certifique-se que esta linha está presente e correta

  // Exemplo de rota de teste:
  app.get('/', (req, res) => {
    res.send('API Maximundi está rodando!');
  });

  // Inicia o servidor
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Falha ao iniciar o servidor devido a erro no DB:', err);
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).send('Erro interno do servidor.');
});