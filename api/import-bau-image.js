/* ==========================================================================
   ANDRADE GARAGE — api/import-bau-image.js
   Recebe um print do baú do jogo, manda pra IA de visão (lib/vision.js) e
   devolve a lista de itens detectados. NÃO grava nada no banco sozinho —
   quem decide o que entra no Baú é sempre o usuário, confirmando na tela
   de revisão depois. Exige login, igual todo o resto do sistema.
   ========================================================================== */

const { getSessionFromRequest } = require("../lib/auth");
const { analyzeInventoryImage } = require("../lib/vision");

const MAX_IMAGE_LENGTH = 8_000_000; // ~6MB decodificado, folga generosa
const IMAGE_RE = /^data:image\/(png|jpe?g|webp);base64,(.+)$/i;

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
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }

  const body = parseBody(req);
  const image = typeof body.image === "string" ? body.image : "";

  if (!image) {
    res.status(400).json({ error: "Envie uma imagem." });
    return;
  }
  if (image.length > MAX_IMAGE_LENGTH) {
    res.status(413).json({ error: "Imagem muito grande. Tente um print menor." });
    return;
  }

  const match = image.match(IMAGE_RE);
  if (!match) {
    res.status(400).json({ error: "Formato de imagem inválido (use PNG, JPG ou WEBP)." });
    return;
  }

  const mimeType = `image/${match[1].toLowerCase().replace("jpg", "jpeg")}`;
  const base64 = match[2];

  try {
    const result = await analyzeInventoryImage({ base64, mimeType });
    if (!result.items.length) {
      res.status(200).json({ items: [], warning: "Nenhum item foi identificado nessa imagem." });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Erro na importação por imagem:", err);
    if (err.code === "NO_API_KEY") {
      res.status(503).json({ error: "Importação por IA não configurada no servidor. Peça pro admin configurar a GEMINI_API_KEY." });
      return;
    }
    if (err.code === "RATE_LIMITED") {
      res.status(429).json({ error: "A IA está sobrecarregada no momento (limite gratuito). Tente de novo em alguns segundos." });
      return;
    }
    res.status(502).json({ error: "Não foi possível analisar a imagem agora. Tente novamente." });
  }
};
