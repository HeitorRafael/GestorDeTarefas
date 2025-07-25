const getPool = require('./db');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  const pool = getPool();
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt); // Senha padrão: admin123
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

    // Apenas manter usuário admin - remover usuário demo
    console.log('Usuário admin configurado. Usuários demo devem ser criados conforme necessário.');

    // 2. Criar Tabela Tasks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Tasks (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL
      );
    `);
    console.log('Tabela Tasks verificada/criada.');

    // Inserir tarefas iniciais básicas (genéricas)
    const initialTasks = [
      'Desenvolvimento', 'Reuniões', 'Documentação', 'Suporte'
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

    // Inserir clientes iniciais básicos (exemplos genéricos)
    const initialClients = [
      'Cliente 1', 'Cliente 2', 'Cliente 3', 'Cliente 4'
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
      notes TEXT,
      CONSTRAINT chk_time_order CHECK (endTime IS NULL OR endTime >= startTime)
  );
`);
console.log('Tabela TimeEntries verificada/criada.');

// Adicionar coluna notes se não existir (para bancos existentes)
try {
  await pool.query(`
    ALTER TABLE TimeEntries 
    ADD COLUMN IF NOT EXISTS notes TEXT;
  `);
  console.log('Coluna notes verificada/adicionada à tabela TimeEntries.');
} catch (err) {
  console.log('Coluna notes já existe ou erro na adição:', err.message);
}

    console.log('Banco de dados inicializado com sucesso!');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
    process.exit(1); // Encerra o processo se houver um erro na inicialização
  }
}

// Função para resetar o banco de dados para estado inicial
async function resetDatabase() {
  const pool = getPool();
  try {
    console.log('Iniciando reset do banco de dados...');
    
    // 1. Remover todos os dados das tabelas (em ordem devido às FK)
    await pool.query('DELETE FROM TimeEntries');
    console.log('Todos os registros de tempo removidos.');
    
    await pool.query('DELETE FROM Users WHERE username NOT IN (\'admin\')');
    console.log('Usuários adicionais removidos (apenas admin mantido).');
    
    await pool.query('DELETE FROM Tasks');
    console.log('Todas as tarefas removidas.');
    
    await pool.query('DELETE FROM Clients');
    console.log('Todos os clientes removidos.');
    
    // 2. Reset dos IDs auto-increment
    await pool.query('ALTER SEQUENCE timeentries_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE clients_id_seq RESTART WITH 1');
    console.log('Sequências de ID resetadas.');
    
    // 3. Reinserir dados iniciais
    // Inserir tarefas iniciais
    const resetTasks = [
      'Desenvolvimento', 'Reuniões', 'Documentação', 'Suporte'
    ];
    for (const taskName of resetTasks) {
      await pool.query('INSERT INTO Tasks (name) VALUES ($1)', [taskName]);
    }
    console.log('Tarefas iniciais reinseridas.');

    // Inserir clientes iniciais básicos
    const resetClients = [
      'Cliente 1', 'Cliente 2', 'Cliente 3', 'Cliente 4'
    ];
    for (const clientName of resetClients) {
      await pool.query('INSERT INTO Clients (name) VALUES ($1)', [clientName]);
    }
    console.log('Clientes iniciais reinseridos.');
    
    // 4. Atualizar senha do usuário admin
    const salt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash('admin123', salt);
    await pool.query("UPDATE Users SET password = $1 WHERE username = 'admin'", [adminHashedPassword]);
    console.log('Senha do usuário admin atualizada.');
    
    console.log('Reset do banco de dados concluído com sucesso!');
    console.log('Estado atual: apenas usuário admin, tarefas e clientes básicos, nenhum registro de tempo.');
    
  } catch (err) {
    console.error('Erro ao resetar o banco de dados:', err);
    throw err;
  }
}

module.exports = { 
  default: initializeDatabase,
  initializeDatabase,
  resetDatabase
};