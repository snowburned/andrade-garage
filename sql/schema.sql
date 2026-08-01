-- ANDRADE GARAGE — tabela de usuários do login
-- Rode este script uma vez no seu banco Neon (SQL Editor do console da Neon,
-- ou via `psql "$DATABASE_URL" -f sql/schema.sql`).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Não existe nenhum jeito de criar usuário por aqui além deste SQL ou do
-- script scripts/create-user.js. Não há tela nem rota pública de cadastro.
