/* ==========================================================================
   ANDRADE GARAGE — api/me.js
   Usado pelo auth-guard.js em toda página protegida para checar se a
   sessão (cookie httpOnly) ainda é válida.
   ========================================================================== */

const { getSessionFromRequest } = require("../lib/auth");

module.exports = async (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }
  res.status(200).json({ id: session.sub, username: session.username });
};
