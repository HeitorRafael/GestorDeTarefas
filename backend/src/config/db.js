const { Pool } = require('pg');

let poolInstance;

function getPool() {
  if (!poolInstance) {
    poolInstance = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    poolInstance.on('error', (err) => {
      console.error('Erro inesperado no cliente PostgreSQL', err);
      process.exit(-1);
    });

    console.log(`Conectando ao banco de dados: ${process.env.DB_DATABASE} no host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  }
  return poolInstance;
}

module.exports = getPool;