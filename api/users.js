/* ==========================================================================
   ANDRADE GARAGE — api/users.js
   Gerencia usuários do login. TODA rota aqui exige uma sessão válida
   (cookie httpOnly) — ou seja, só quem já está logado consegue criar,
   listar, trocar senha ou excluir usuários. Continua não existindo
   nenhuma rota pública de cadastro.
   ========================================================================== */

const bcrypt = require("bcryptjs");
const { getPool } = require("../lib/db");
const { getSessionFromRequest } = require("../lib/auth");

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

function getIdFromQuery(req) {
  if (req.query && req.query.id !== undefined) return Number(req.query.id);
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    return Number(url.searchParams.get("id"));
  } catch {
    return NaN;
  }
}

function parseBody(req) {
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  return body || {};
}

module.exports = async (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  const pool = getPool();

  /* --------------------------- Listar usuários --------------------------- */
  if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT id, username, created_at FROM users ORDER BY created_at ASC"
      );
      res.status(200).json({ users: result.rows });
    } catch (err) {
      console.error("Erro ao listar usuários:", err);
      res.status(500).json({ error: "Erro ao buscar usuários." });
    }
    return;
  }

  /* ---------------------------- Criar usuário ----------------------------- */
  if (req.method === "POST") {
    const body = parseBody(req);
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      res.status(400).json({ error: "Usuário e senha são obrigatórios." });
      return;
    }
    if (!USERNAME_RE.test(username)) {
      res.status(400).json({
        error: "Usuário deve ter 3-32 caracteres: letras minúsculas, números, ponto, traço ou underline.",
      });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "A senha precisa ter pelo menos 8 caracteres." });
      return;
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
        [username, hash]
      );
      res.status(201).json({ user: result.rows[0] });
    } catch (err) {
      if (err.code === "23505") {
        res.status(409).json({ error: "Já existe um usuário com esse nome." });
        return;
      }
      console.error("Erro ao criar usuário:", err);
      res.status(500).json({ error: "Erro ao criar usuário." });
    }
    return;
  }

  /* -------------------------- Trocar senha (PUT) --------------------------- */
  if (req.method === "PUT") {
    const body = parseBody(req);
    const id = Number(body.id);
    const password = typeof body.password === "string" ? body.password : "";

    if (!id || !password) {
      res.status(400).json({ error: "Usuário e nova senha são obrigatórios." });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "A senha precisa ter pelo menos 8 caracteres." });
      return;
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, username",
        [hash, id]
      );
      if (!result.rows.length) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Erro ao trocar senha:", err);
      res.status(500).json({ error: "Erro ao trocar senha." });
    }
    return;
  }

  /* ---------------------------- Excluir usuário ---------------------------- */
  if (req.method === "DELETE") {
    const id = getIdFromQuery(req);
    if (!id) {
      res.status(400).json({ error: "Id do usuário é obrigatório." });
      return;
    }
    if (id === session.sub) {
      res.status(400).json({ error: "Você não pode excluir o próprio usuário logado." });
      return;
    }

    try {
      const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM users");
      if (countResult.rows[0].count <= 1) {
        res.status(400).json({ error: "Não é possível excluir o último usuário do sistema." });
        return;
      }
      await pool.query("DELETE FROM users WHERE id = $1", [id]);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      res.status(500).json({ error: "Erro ao excluir usuário." });
    }
    return;
  }

  res.status(405).json({ error: "Método não permitido." });
};
