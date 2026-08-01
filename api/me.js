/* ==========================================================================
   ANDRADE GARAGE — api/me.js
   Usado pelo auth-guard.js em toda página protegida para checar se a
   sessão (cookie httpOnly) ainda é válida, e também pra devolver o perfil
   completo (nome de exibição, foto, cargo) usado no rodapé da sidebar.
   ========================================================================== */

const { getPool } = require("../lib/db");
const { getSessionFromRequest } = require("../lib/auth");

module.exports = async (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT id, username, display_name, avatar_data, role FROM users WHERE id = $1 LIMIT 1",
      [session.sub]
    );
    const user = result.rows[0];

    if (!user) {
      // Sessão válida mas o usuário foi excluído nesse meio tempo.
      res.status(401).json({ error: "Não autenticado." });
      return;
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      displayName: user.display_name || user.username,
      avatarData: user.avatar_data || null,
      role: user.role || null,
    });
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    res.status(500).json({ error: "Erro ao buscar perfil." });
  }
};
