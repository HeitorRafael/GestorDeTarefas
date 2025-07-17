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

    // Inserir ou atualizar um usuário comum padrão
    const userSalt = await bcrypt.genSalt(10);
    const userHashedPassword = await bcrypt.hash('senha123', userSalt); // Senha padrão: senha123
    const { rows: userRows } = await pool.query("SELECT * FROM Users WHERE username = 'user1'");
    if (userRows.length === 0) {
      await pool.query(
        "INSERT INTO Users (username, password, role) VALUES ($1, $2, 'common')",
        ['user1', userHashedPassword]
      );
      console.log('Usuário comum padrão inserido.');
    } else {
      await pool.query(
        "UPDATE Users SET password = $1 WHERE username = 'user1'",
        [userHashedPassword]
      );
      console.log('Senha do usuário comum padrão atualizada.');
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
    
    await pool.query('DELETE FROM Users WHERE username NOT IN (\'admin\', \'user1\')');
    console.log('Usuários adicionais removidos (admin e user1 mantidos).');
    
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
    const initialTasks = [
      'Cadastro cotação', 'Fechamento', 'Envio de cotações aos cliente', 'Casos complexos'
    ];
    for (const taskName of initialTasks) {
      await pool.query('INSERT INTO Tasks (name) VALUES ($1)', [taskName]);
    }
    console.log('Tarefas iniciais reinseridas.');

    // Inserir clientes iniciais
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
      await pool.query('INSERT INTO Clients (name) VALUES ($1)', [clientName]);
    }
    console.log('Clientes iniciais reinseridos.');
    
    // 4. Atualizar senhas dos usuários padrão
    const salt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash('admin123', salt);
    await pool.query("UPDATE Users SET password = $1 WHERE username = 'admin'", [adminHashedPassword]);
    
    const userSalt = await bcrypt.genSalt(10);
    const userHashedPassword = await bcrypt.hash('senha123', userSalt);
    await pool.query("UPDATE Users SET password = $1 WHERE username = 'user1'", [userHashedPassword]);
    console.log('Senhas dos usuários padrão atualizadas.');
    
    console.log('Reset do banco de dados concluído com sucesso!');
    console.log('Estado atual: apenas usuários admin/user1, todas as tarefas e clientes iniciais, nenhum registro de tempo.');
    
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