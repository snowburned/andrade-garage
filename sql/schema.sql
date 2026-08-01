-- ANDRADE GARAGE — tabela de usuários do login
-- Rode este script uma vez no seu banco Neon (SQL Editor do console da Neon,
-- ou via `psql "$DATABASE_URL" -f sql/schema.sql`).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perfil: nome de exibição, foto (guardada como data URL base64) e cargo.
-- Rode isto também se você já tinha criado a tabela "users" antes dessas
-- colunas existirem — é seguro rodar de novo (IF NOT EXISTS).
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_data   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role          TEXT;

-- Não existe nenhum jeito de criar usuário por aqui além deste SQL ou do
-- script scripts/create-user.js. Não há tela nem rota pública de cadastro.
