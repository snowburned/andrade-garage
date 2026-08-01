/* ==========================================================================
   ANDRADE GARAGE — api/profile.js
   Deixa o usuário logado trocar o PRÓPRIO nome de exibição e foto de
   perfil. Sempre atua sobre o dono da sessão (session.sub) — nunca recebe
   um "id" de fora, então ninguém consegue editar o perfil de outra
   pessoa por aqui. O cargo (role) só é definido pelo admin, na aba
   Usuários (api/users.js).
   ========================================================================== */

const { getPool } = require("../lib/db");
const { getSessionFromRequest } = require("../lib/auth");

const MAX_AVATAR_LENGTH = 900_000; // ~650KB decodificado, folga generosa
const AVATAR_RE = /^data:image\/(png|jpe?g|webp|gif);base64,/i;

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
  if (req.method !== "PUT") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  const body = parseBody(req);
  const fields = [];
  const values = [];
  let i = 1;

  if ("displayName" in body) {
    const raw = typeof body.displayName === "string" ? body.displayName.trim() : "";
    if (raw && (raw.length < 2 || raw.length > 40)) {
      res.status(400).json({ error: "O nome de exibição deve ter entre 2 e 40 caracteres." });
      return;
    }
    fields.push(`display_name = $${i++}`);
    values.push(raw || null); // vazio → volta a mostrar o username
  }

  if ("avatarData" in body) {
    if (body.avatarData === null) {
      fields.push(`avatar_data = $${i++}`);
      values.push(null);
    } else if (typeof body.avatarData === "string") {
      if (body.avatarData.length > MAX_AVATAR_LENGTH) {
        res.status(413).json({ error: "Imagem muito grande. Escolha uma foto menor." });
        return;
      }
      if (!AVATAR_RE.test(body.avatarData)) {
        res.status(400).json({ error: "Formato de imagem inválido." });
        return;
      }
      fields.push(`avatar_data = $${i++}`);
      values.push(body.avatarData);
    }
  }

  if (!fields.length) {
    res.status(400).json({ error: "Nada para atualizar." });
    return;
  }

  values.push(session.sub);

  try {
    const pool = getPool();
    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${i} RETURNING id, username, display_name, avatar_data, role`,
      values
    );
    const user = result.rows[0];
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    res.status(200).json({
      profile: {
        id: user.id,
        username: user.username,
        displayName: user.display_name || user.username,
        avatarData: user.avatar_data || null,
        role: user.role || null,
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
};
