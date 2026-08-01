/* ==========================================================================
   ANDRADE GARAGE — lib/db.js
   Conexão com o Postgres do Neon. Reaproveita a mesma pool entre chamadas
   de função serverless (Vercel mantém o processo "morno" entre execuções).
   ========================================================================== */

const { Pool } = require("pg");

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL não configurada. Defina a connection string do Neon nas variáveis de ambiente."
      );
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

module.exports = { getPool };
