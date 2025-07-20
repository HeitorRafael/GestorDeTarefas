// Reset SEGURO do banco de dados
require('dotenv').config();
const { resetDatabase } = require('./src/config/initDb');
const readline = require('readline');
const crypto = require('crypto');

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para gerar senha aleatória
function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Função para confirmar ação
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'sim' || answer.toLowerCase() === 's');
    });
  });
}

// Função para backup simples (exportar dados importantes)
async function createBackup() {
  const getPool = require('./src/config/db');
  const pool = getPool();
  const fs = require('fs');
  
  try {
    console.log('📦 Criando backup de dados importantes...');
    
    // Backup de usuários (sem senhas)
    const { rows: users } = await pool.query('SELECT id, username, role FROM Users');
    
    // Backup de registros de tempo (últimos 30 dias)
    const { rows: timeEntries } = await pool.query(`
      SELECT te.*, u.username, t.name as task_name, c.name as client_name 
      FROM TimeEntries te
      JOIN Users u ON te.userId = u.id
      JOIN Tasks t ON te.taskId = t.id  
      JOIN Clients c ON te.clientId = c.id
      WHERE te.startTime >= NOW() - INTERVAL '30 days'
    `);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      users: users.filter(u => u.username !== 'admin' && u.username !== 'user1'),
      timeEntries: timeEntries,
      recordCount: {
        users: users.length,
        timeEntries: timeEntries.length
      }
    };
    
    const backupFileName = `backup_maximundi_${new Date().toISOString().slice(0,10)}.json`;
    fs.writeFileSync(backupFileName, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup salvo em: ${backupFileName}`);
    
    return backupFileName;
  } catch (err) {
    console.error('❌ Erro ao criar backup:', err.message);
    throw err;
  }
}

async function safeReset() {
  try {
    console.log('🔒 === RESET SEGURO DO BANCO MAXIMUNDI ===\n');
    
    // 1. Verificar ambiente
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  ATENÇÃO: Você está em ambiente de PRODUÇÃO!');
      const confirmProd = await askConfirmation('Tem certeza que deseja continuar? (sim/não): ');
      if (!confirmProd) {
        console.log('❌ Reset cancelado por segurança.');
        rl.close();
        return;
      }
    }
    
    // 2. Mostrar o que será feito
    console.log('📋 O reset irá:');
    console.log('   ❌ APAGAR todos os registros de tempo');
    console.log('   ❌ APAGAR todos os usuários (exceto admin/user1)');
    console.log('   ❌ APAGAR todas as tarefas personalizadas');
    console.log('   ❌ APAGAR todos os clientes personalizados');
    console.log('   ✅ MANTER usuários admin/user1 com novas senhas');
    console.log('   ✅ REINSERIR dados iniciais\n');
    
    // 3. Primeira confirmação
    const firstConfirm = await askConfirmation('Deseja continuar com o reset? (sim/não): ');
    if (!firstConfirm) {
      console.log('❌ Reset cancelado.');
      rl.close();
      return;
    }
    
    // 4. Criar backup
    const createBackupConfirm = await askConfirmation('Deseja criar backup antes do reset? (RECOMENDADO) (sim/não): ');
    let backupFile = null;
    if (createBackupConfirm) {
      backupFile = await createBackup();
    }
    
    // 5. Confirmação final
    console.log('\n⚠️  ÚLTIMA CONFIRMAÇÃO!');
    console.log('Esta ação é IRREVERSÍVEL e apagará dados do sistema.');
    const finalConfirm = await askConfirmation('Digite "CONFIRMO" para prosseguir: ');
    if (!finalConfirm) {
      console.log('❌ Reset cancelado na confirmação final.');
      rl.close();
      return;
    }
    
    // 6. Gerar novas senhas seguras
    const newAdminPassword = generateSecurePassword(16);
    const newUserPassword = generateSecurePassword(12);
    
    console.log('\n🔄 Iniciando reset do banco de dados...');
    
    // 7. Executar reset (versão modificada que aceita senhas)
    await resetDatabaseSecure(newAdminPassword, newUserPassword);
    
    // 8. Mostrar resultado sem expor senhas
    console.log('\n✅ BANCO DE DADOS RESETADO COM SUCESSO!');
    console.log('\n📊 Estado atual do sistema:');
    console.log('   👤 Usuários: admin e user1 com NOVAS senhas');
    console.log('   🏢 Clientes: todos os iniciais reinseridos');
    console.log('   📋 Tarefas: todas as iniciais reinseridas');
    console.log('   ⏰ Registros de tempo: TODOS REMOVIDOS');
    
    // 9. Salvar credenciais em arquivo seguro
    const credentials = {
      admin: { username: 'admin', password: newAdminPassword },
      user1: { username: 'user1', password: newUserPassword },
      resetDate: new Date().toISOString(),
      backup: backupFile
    };
    
    const credentialsFile = `credenciais_${new Date().toISOString().slice(0,10)}.json`;
    require('fs').writeFileSync(credentialsFile, JSON.stringify(credentials, null, 2));
    
    console.log('\n🔐 CREDENCIAIS SALVAS EM:', credentialsFile);
    console.log('⚠️  IMPORTANTE: Anote as credenciais e delete o arquivo após configurar!');
    
    if (backupFile) {
      console.log('\n📦 Backup salvo em:', backupFile);
    }
    
    console.log('\n🎯 Sistema MaxiMundi pronto para entrega!');
    
  } catch (err) {
    console.error('\n❌ ERRO DURANTE O RESET:', err.message);
    console.error('O sistema pode estar em estado inconsistente.');
    console.error('Verifique o banco de dados e restaure backup se necessário.');
  } finally {
    rl.close();
  }
}

// Versão segura da função de reset que aceita senhas personalizadas
async function resetDatabaseSecure(adminPassword, userPassword) {
  const getPool = require('./src/config/db');
  const bcrypt = require('bcryptjs');
  const pool = getPool();
  
  try {
    // 1. Remover dados
    await pool.query('DELETE FROM TimeEntries');
    await pool.query('DELETE FROM Users WHERE username NOT IN (\'admin\', \'user1\')');
    await pool.query('DELETE FROM Tasks');
    await pool.query('DELETE FROM Clients');
    
    // 2. Reset sequências
    await pool.query('ALTER SEQUENCE timeentries_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE clients_id_seq RESTART WITH 1');
    
    // 3. Reinserir dados iniciais
    const initialTasks = [
      'Desenvolvimento', 'Reuniões', 'Documentação', 'Suporte'
    ];
    for (const taskName of initialTasks) {
      await pool.query('INSERT INTO Tasks (name) VALUES ($1)', [taskName]);
    }
    
    const initialClients = [
      'Cliente 1', 'Cliente 2', 'Cliente 3', 'Cliente 4'
    ];
    for (const clientName of initialClients) {
      await pool.query('INSERT INTO Clients (name) VALUES ($1)', [clientName]);
    }
    
    // 4. Atualizar senhas com as geradas
    const salt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash(adminPassword, salt);
    await pool.query("UPDATE Users SET password = $1 WHERE username = 'admin'", [adminHashedPassword]);
    
    const userSalt = await bcrypt.genSalt(10);
    const userHashedPassword = await bcrypt.hash(userPassword, userSalt);
    await pool.query("UPDATE Users SET password = $1 WHERE username = 'user1'", [userHashedPassword]);
    
    console.log('✅ Reset concluído com segurança!');
    
  } catch (err) {
    console.error('Erro no reset seguro:', err);
    throw err;
  }
}

// Executar reset seguro
safeReset();
