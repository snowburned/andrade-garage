/* ==========================================================================
   ANDRADE GARAGE — scripts/create-user.js

   ESTE É O ÚNICO JEITO DE CRIAR OU TROCAR A SENHA DE UM USUÁRIO.
   Não existe rota /api de cadastro — de propósito, para que só quem tem
   a DATABASE_URL (você) consiga criar acessos.

   Uso:
     node scripts/create-user.js <usuario> <senha>

   Exemplo:
     node scripts/create-user.js admin "SenhaForte123!"

   Requer um arquivo .env na raiz do projeto com:
     DATABASE_URL=postgresql://...neon.tech/...?sslmode=require
   ========================================================================== */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

async function main() {
  const [, , username, password] = process.argv;

  if (!username || !password) {
    console.log("Uso: node scripts/create-user.js <usuario> <senha>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("A senha precisa ter pelo menos 8 caracteres.");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL não encontrada. Crie um arquivo .env (veja .env.example).");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const cleanUsername = username.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [cleanUsername, hash]
    );
    console.log(`✅ Usuário "${cleanUsername}" criado/atualizado com sucesso.`);
  } catch (err) {
    console.error("Erro ao criar usuário:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
