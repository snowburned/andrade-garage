/* ==========================================================================
   ANDRADE GARAGE — api/bau.js
   Cada usuário tem o próprio Baú (estoque), guardado em bau_data (JSONB),
   sempre a partir do session.sub — ninguém consegue ler ou escrever o
   Baú de outra pessoa por aqui.
   ========================================================================== */

const { getPool } = require("../lib/db");
const { getSessionFromRequest } = require("../lib/auth");

const MAX_ITEMS = 2000;
const MAX_JSON_LENGTH = 2_000_000; // ~2MB, folga generosa

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

  /* ------------------------------ Ler o Baú -------------------------------- */
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT bau_data FROM users WHERE id = $1", [session.sub]);
      const row = result.rows[0];
      res.status(200).json({ items: row ? row.bau_data : null });
    } catch (err) {
      console.error("Erro ao buscar Baú:", err);
      res.status(500).json({ error: "Erro ao buscar o Baú." });
    }
    return;
  }

  /* ----------------------------- Salvar o Baú ------------------------------ */
  if (req.method === "PUT") {
    const body = parseBody(req);
    if (!Array.isArray(body.items)) {
      res.status(400).json({ error: "Formato inválido: items precisa ser uma lista." });
      return;
    }
    if (body.items.length > MAX_ITEMS) {
      res.status(413).json({ error: `Muitos itens no Baú (máximo ${MAX_ITEMS}).` });
      return;
    }

    const json = JSON.stringify(body.items);
    if (json.length > MAX_JSON_LENGTH) {
      res.status(413).json({ error: "Baú muito grande pra salvar." });
      return;
    }

    try {
      await pool.query("UPDATE users SET bau_data = $1::jsonb WHERE id = $2", [json, session.sub]);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Erro ao salvar Baú:", err);
      res.status(500).json({ error: "Erro ao salvar o Baú." });
    }
    return;
  }

  /* ------------------------- Limpar (voltar ao padrão) ---------------------- */
  if (req.method === "DELETE") {
    try {
      await pool.query("UPDATE users SET bau_data = NULL WHERE id = $1", [session.sub]);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Erro ao limpar Baú:", err);
      res.status(500).json({ error: "Erro ao limpar o Baú." });
    }
    return;
  }

  res.status(405).json({ error: "Método não permitido." });
};
