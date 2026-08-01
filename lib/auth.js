/* ==========================================================================
   ANDRADE GARAGE — lib/auth.js
   Sessão via cookie httpOnly assinado (JWT). Não existe cadastro público:
   os únicos jeitos de criar um usuário são o SQL em sql/schema.sql/console
   da Neon, ou o script scripts/create-user.js rodado por você localmente.
   ========================================================================== */

const jwt = require("jsonwebtoken");

const COOKIE_NAME = "ag_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET não configurada. Defina uma string aleatória longa nas variáveis de ambiente."
    );
  }
  return secret;
}

function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: MAX_AGE_SECONDS });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function buildCookie(token) {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${MAX_AGE_SECONDS}`,
    "SameSite=Strict",
  ];
  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

function buildClearCookie() {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [`${COOKIE_NAME}=`, "HttpOnly", "Path=/", "Max-Age=0", "SameSite=Strict"];
  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  COOKIE_NAME,
  signToken,
  verifyToken,
  buildCookie,
  buildClearCookie,
  getSessionFromRequest,
};
