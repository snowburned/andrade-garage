/* ==========================================================================
   ANDRADE GARAGE — auth-guard.js
   Incluir no <head> (antes do resto do conteúdo) de toda página protegida.
   Verifica a sessão no servidor (/api/me) e redireciona para login.html se
   não houver sessão válida. Também liga qualquer botão #logoutBtn.
   ========================================================================== */

(function () {
  // Esconde o conteúdo até confirmarmos a sessão, pra não "piscar" a página
  // protegida antes do redirect.
  document.documentElement.style.visibility = "hidden";

  async function guard() {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) {
        window.location.replace("login.html");
        return;
      }
      document.documentElement.style.visibility = "visible";
    } catch (err) {
      // Sem conseguir falar com o backend, por segurança manda pro login.
      window.location.replace("login.html");
    }
  }

  guard();

  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await fetch("/api/logout", { method: "POST", credentials: "include" });
        } finally {
          window.location.replace("login.html");
        }
      });
    }
  });
})();
