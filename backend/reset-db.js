// Reset do banco de dados
require('dotenv').config();
const { resetDatabase } = require('./src/config/initDb');

console.log('🔄 Iniciando reset do banco de dados...');

resetDatabase()
  .then(() => {
    console.log('✅ BANCO DE DADOS RESETADO COM SUCESSO!');
    console.log('');
    console.log('📊 Estado atual do sistema:');
    console.log('   👤 Usuários: admin (admin123), user1 (senha123)');
    console.log('   🏢 Clientes: todos os iniciais reinseridos');
    console.log('   📋 Tarefas: todas as iniciais reinseridas');
    console.log('   ⏰ Registros de tempo: TODOS REMOVIDOS');
    console.log('');
    console.log('🎯 Sistema MaxiMundi pronto para entrega!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro no reset:', err.message);
    console.error(err);
    process.exit(1);
  });
