const pool = require('./db');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    // 1. Criar Tabela Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'common'
      );
    `);
    console.log('Tabela Users verificada/criada.');

    // Inserir ou atualizar um usuário admin padrão
    const hashedPassword = 'admin123'; // Senha padrão: admin123 (TEMPORARY - DO NOT USE IN PRODUCTION)
    const { rows } = await pool.query("SELECT * FROM Users WHERE username = 'admin'");
    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO Users (username, password, role) VALUES ($1, $2, 'admin')",
        ['admin', hashedPassword]
      );
      console.log('Usuário admin padrão inserido.');
    } else {
      await pool.query(
        "UPDATE Users SET password = $1 WHERE username = 'admin'",
        [hashedPassword]
      );
      console.log('Senha do usuário admin padrão atualizada.');
    }

    // 2. Criar Tabela Tasks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Tasks (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL
      );
    `);
    console.log('Tabela Tasks verificada/criada.');

    // Inserir tarefas iniciais (da Imagem 1)
    const initialTasks = [
      'Cadastro cotação', 'Fechamento', 'Envio de cotações aos cliente', 'Casos complexos'
    ];
    for (const taskName of initialTasks) {
      await pool.query(
        'INSERT INTO Tasks (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [taskName]
      );
    }
    console.log('Tarefas iniciais verificadas/inseridas.');

    // 3. Criar Tabela Clients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Clients (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL
      );
    `);
    console.log('Tabela Clients verificada/criada.');

    // Inserir clientes iniciais (da Imagem 2)
    const initialClients = [
      'Amazon Polpas', 'Argo Foods', 'Ebram', 'TG Projects', 'PQVIRK', 'Inbra', 'Cedro',
      'Gpagro', 'FCN Prime', 'Lusitano da Amazonia', 'Pneu Free', 'Empório dos Mármores',
      'FG Resinas', 'Grupo vita sano', 'Tramontina Belém', 'Biomed', 'Mundo dos Ferros',
      'OPT', 'UNESP', 'KRG', 'Brasil internacional', 'Duoflex', 'Purcom', 'Valgroup',
      'Tramontina delta', 'Clean amazonas', 'Raposo Plásticos', 'Amaxxon', 'The controller',
      'EnVimat', 'Formaggio', 'GR Water', 'Maringá Ferros', 'Alpha comex', 'Lusitano',
      'Digital conect', 'Qualitronix', 'Adar Indústria', 'Tramontina garibaldi'
    ];
    for (const clientName of initialClients) {
      await pool.query(
        'INSERT INTO Clients (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [clientName]
      );
    }
    console.log('Clientes iniciais verificados/inseridos.');

// 4. Criar Tabela TimeEntries
await pool.query(`
  CREATE TABLE IF NOT EXISTS TimeEntries (
      id SERIAL PRIMARY KEY,
      userId INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
      taskId INTEGER NOT NULL REFERENCES Tasks(id) ON DELETE CASCADE,
      clientId INTEGER NOT NULL REFERENCES Clients(id) ON DELETE CASCADE,
      startTime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      endTime TIMESTAMP WITH TIME ZONE,
      duration INTEGER,
      CONSTRAINT chk_time_order CHECK (endTime IS NULL OR endTime >= startTime)
  );
`);
console.log('Tabela TimeEntries verificada/criada.');

    console.log('Banco de dados inicializado com sucesso!');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
    process.exit(1); // Encerra o processo se houver um erro na inicialização
  }
}

module.exports = initializeDatabase;