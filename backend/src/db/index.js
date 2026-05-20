// Conexión a PostgreSQL mediante un pool de clientes pg.
// La cadena de conexión se lee de DATABASE_URL (variable de entorno).
// Un error inesperado en un cliente inactivo cierra el proceso para evitar
// conexiones corruptas en el pool.

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Si un cliente del pool falla estando inactivo, se termina el proceso
pool.on('error', (err) => {
  console.error('Unexpected DB client error', err);
  process.exit(-1);
});

module.exports = pool;
