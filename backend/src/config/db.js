const { Pool } = require('pg');

let poolInstance;

function getPool() {
  if (!poolInstance) {
    // Configuração específica para Windows
    const poolConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_DATABASE || 'maximundi',
      password: String(process.env.DB_PASSWORD || '0159357'),
      port: parseInt(process.env.DB_PORT || 5432),
      // Configurações específicas para Windows
      ssl: false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10,
      min: 2,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    };

    poolInstance = new Pool(poolConfig);

    poolInstance.on('error', (err) => {
      console.error('Erro inesperado no cliente PostgreSQL:', err.message);
      // Em Windows, não force exit imediatamente - permite reconexão
      console.error('Tentando reconectar automaticamente...');
      
      // Reset da pool para permitir reconexão
      setTimeout(() => {
        if (poolInstance) {
          poolInstance.end().catch(console.error);
          poolInstance = null;
        }
      }, 5000);
    });

    poolInstance.on('connect', (client) => {
      console.log('✅ Nova conexão estabelecida com PostgreSQL');
      // Log da versão do PostgreSQL para debug
      client.query('SELECT version()', (err, result) => {
        if (!err && result.rows[0]) {
          console.log(`📊 PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
        }
      });
    });

    poolInstance.on('remove', (client) => {
      console.log('🔌 Conexão PostgreSQL removida do pool');
    });

    console.log(`🔗 Conectando ao banco de dados: ${poolConfig.database} no host: ${poolConfig.host}:${poolConfig.port}`);
  }
  return poolInstance;
}

// Função para testar conexão
async function testConnection() {
  try {
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexão com banco de dados testada com sucesso');
    return true;
  } catch (err) {
    console.error('❌ Erro ao testar conexão com banco:', err.message);
    return false;
  }
}

// Função para fechar pool graciosamente
async function closePool() {
  if (poolInstance) {
    try {
      await poolInstance.end();
      poolInstance = null;
      console.log('🔒 Pool de conexões fechado');
    } catch (err) {
      console.error('Erro ao fechar pool:', err.message);
    }
  }
}

module.exports = getPool;
module.exports.testConnection = testConnection;
module.exports.closePool = closePool;