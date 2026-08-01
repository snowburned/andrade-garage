/* ==========================================================================
   ANDRADE GARAGE — auth-guard.js
   Incluir no <head> (antes do resto do conteúdo) de toda página protegida.
   Verifica a sessão no servidor (/api/me) e redireciona para login.html se
   não houver sessão válida. Também liga qualquer botão #logoutBtn, e deixa
   o perfil carregado (nome, foto, cargo) disponível em window.AG_PROFILE
   e no evento "ag:profile-loaded", pra outras páginas (ex: script.js)
   usarem no rodapé da sidebar sem precisar buscar de novo.
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
      const profile = await res.json();
      window.AG_PROFILE = profile;
      document.documentElement.style.visibility = "visible";
      window.dispatchEvent(new CustomEvent("ag:profile-loaded", { detail: profile }));
    } catch (err) {
      // Sem conseguir falar com o backend, por segurança manda pro login.
      window.location.replace("login.html");
    }
  }

  guard();

  window.AG_logout = async function () {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } finally {
      window.location.replace("login.html");
    }
  };

  // Recarrega e republica o perfil (usado depois de salvar mudanças em Perfil).
  window.AG_refreshProfile = async function () {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) return null;
      const profile = await res.json();
      window.AG_PROFILE = profile;
      window.dispatchEvent(new CustomEvent("ag:profile-loaded", { detail: profile }));
      return profile;
    } catch {
      return null;
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", window.AG_logout);
    }
  });
})();
