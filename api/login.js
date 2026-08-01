/* ==========================================================================
   ANDRADE GARAGE — api/login.js
   Único endpoint que verifica credenciais. Não existe endpoint de cadastro:
   usuários só são criados via scripts/create-user.js (rodado por você, com
   acesso à DATABASE_URL) ou direto no SQL editor da Neon.
   ========================================================================== */

const bcrypt = require("bcryptjs");
const { getPool } = require("../lib/db");
const { signToken, buildCookie } = require("../lib/auth");

// Hash "vazio" usado quando o usuário não existe, para que o bcrypt.compare
// sempre leve um tempo parecido e não vaze, por timing, se o usuário existe.
const DUMMY_HASH = "$2a$10$C6UzMDM.H6dfI/f/IKcEeO6xzsx3fpJ9O0kzqmqM.cJmQVFrHF9ee";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    res.status(400).json({ error: "Usuário e senha são obrigatórios." });
    return;
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username = $1 LIMIT 1",
      [username]
    );
    const user = result.rows[0];

    const hashToCompare = user ? user.password_hash : DUMMY_HASH;
    const passwordOk = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordOk) {
      res.status(401).json({ error: "Usuário ou senha inválidos." });
      return;
    }

    const token = signToken({ sub: user.id, username: user.username });
    res.setHeader("Set-Cookie", buildCookie(token));
    res.status(200).json({ ok: true, username: user.username });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno ao autenticar. Tente novamente." });
  }
};
