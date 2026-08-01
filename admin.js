/* ==========================================================================
   ANDRADE GARAGE — admin.js
   Painel para trocar as imagens dos cards (Baú, Peças, Moldes CNC) sem
   precisar mexer em código. Cada imagem enviada aqui é salva direto no
   GitHub (branch main) via API, e o mapa de imagens fica em
   assets/image-map.json — o site principal (script.js) lê esse arquivo
   e aplica as imagens automaticamente.

   O acesso a esta página agora é protegido pelo login do site inteiro
   (auth-guard.js + /api/me, com usuários guardados no Neon). Quem protege
   os arquivos de verdade continua sendo o seu Token do GitHub, que fica só
   no seu navegador e nunca é publicado em lugar nenhum.
   ========================================================================== */

const GH_OWNER = "snowburned";
const GH_REPO = "andrade-garage";
const GH_BRANCH = "main";
const IMAGE_MAP_PATH = "assets/image-map.json";
const MAX_IMAGE_DIM = 900;
const TOKEN_STORAGE_KEY = "ag_gh_token";

const TABS = {
  bau: { label: "Baú", folder: "assets/bau", items: () => BAU_ITEMS, iconFor: (item) => "package" },
  parts: { label: "Peças", folder: "assets/parts", items: () => PARTS, iconFor: (item) => CATEGORY_ICONS[item.categoria] || "wrench" },
  moldes: { label: "Moldes CNC", folder: "assets/moldes", items: () => MOLDES_CNC, iconFor: () => "drafting-compass" },
};

let ghToken = localStorage.getItem(TOKEN_STORAGE_KEY) || "";
let imageMap = {};
let imageMapSha = null;
let activeTab = "bau";
let searchQuery = "";
let cardStatus = {}; // id -> "saving" | "saved" | "error"
let cardErrors = {}; // id -> mensagem de erro
let currentUserId = null;
let currentUsername = null;

/* ----------------------------- Utilidades ------------------------------ */

function b64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64DecodeUnicode(str) {
  return decodeURIComponent(escape(atob(str.replace(/\n/g, ""))));
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function toast(msg, type = "info") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast toast-${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 4000);
}

/* ------------------------------ GitHub API ------------------------------ */

async function ghRequest(path, options = {}) {
  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`;
  return fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${ghToken}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
}

async function ghGetFile(path) {
  const res = await ghRequest(`${path}?ref=${GH_BRANCH}`);
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) {
    throw new Error("Token do GitHub inválido ou sem permissão nesse repositório.");
  }
  if (!res.ok) throw new Error(`Erro ao ler ${path} (HTTP ${res.status})`);
  return res.json();
}

async function ghPutFile(path, base64Content, message, sha) {
  const body = { message, content: base64Content, branch: GH_BRANCH };
  if (sha) body.sha = sha;
  const res = await ghRequest(path, { method: "PUT", body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao salvar ${path} (HTTP ${res.status})`);
  }
  return res.json();
}

async function loadImageMap() {
  const file = await ghGetFile(IMAGE_MAP_PATH);
  if (!file) {
    imageMap = {};
    imageMapSha = null;
    return;
  }
  imageMapSha = file.sha;
  imageMap = JSON.parse(b64DecodeUnicode(file.content));
}

async function saveImageMap(commitMsg) {
  const content = b64EncodeUnicode(JSON.stringify(imageMap, null, 2));
  const result = await ghPutFile(IMAGE_MAP_PATH, content, commitMsg, imageMapSha);
  imageMapSha = result.content.sha;
}

/* ----------------------------- Imagem local ------------------------------ */

function resizeImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo não é uma imagem válida."));
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(width, height));
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png").split(",")[1]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* -------------------------------- Upload --------------------------------- */

async function handleFileForItem(item, tabKey, file) {
  if (!ghToken) {
    toast("Cole seu Token do GitHub antes de enviar imagens.", "error");
    openTokenPanel();
    return;
  }
  if (!file.type.startsWith("image/")) {
    toast("Selecione um arquivo de imagem (PNG, JPG, WEBP...).", "error");
    return;
  }

  cardStatus[item.id] = "saving";
  renderGrid();

  try {
    const base64 = await resizeImageToBase64(file);
    const path = `${TABS[tabKey].folder}/${item.id}.png`;

    const existing = await ghGetFile(path);
    await ghPutFile(path, base64, `Admin: atualiza imagem de ${item.nome}`, existing ? existing.sha : null);

    imageMap[item.id] = path;
    await saveImageMap(`Admin: atualiza mapa de imagens (${item.nome})`);

    item.imagem = `data:image/png;base64,${base64}`; // preview imediata local
    cardStatus[item.id] = "saved";
    toast(`Imagem de "${item.nome}" salva no GitHub.`, "success");
  } catch (err) {
    console.error(err);
    cardStatus[item.id] = "error";
    cardErrors[item.id] = err.message;
    toast(`Falha ao salvar "${item.nome}": ${err.message}`, "error");
  }
  renderGrid();
}

async function handleRemoveImage(item) {
  if (!ghToken) {
    toast("Cole seu Token do GitHub antes de remover imagens.", "error");
    openTokenPanel();
    return;
  }
  if (!imageMap[item.id]) return;
  if (!confirm(`Remover a imagem de "${item.nome}"? O arquivo continua no GitHub, só deixa de ser usado.`)) return;

  try {
    delete imageMap[item.id];
    await saveImageMap(`Admin: remove imagem de ${item.nome}`);
    delete item.imagem;
    cardStatus[item.id] = undefined;
    toast(`Imagem de "${item.nome}" removida.`, "success");
  } catch (err) {
    console.error(err);
    toast(`Falha ao remover: ${err.message}`, "error");
  }
  renderGrid();
}

/* --------------------------------- Token --------------------------------- */

function openTokenPanel() {
  document.getElementById("tokenPanel").classList.remove("hidden");
  document.getElementById("tokenInput").focus();
}
function closeTokenPanel() {
  document.getElementById("tokenPanel").classList.add("hidden");
}
function saveToken() {
  const val = document.getElementById("tokenInput").value.trim();
  if (!val) return;
  ghToken = val;
  localStorage.setItem(TOKEN_STORAGE_KEY, val);
  document.getElementById("tokenInput").value = "";
  closeTokenPanel();
  updateTokenStatus();
  refreshMapFromGithub();
}
function clearToken() {
  ghToken = "";
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  updateTokenStatus();
  toast("Token removido deste navegador.", "info");
}
function updateTokenStatus() {
  const el = document.getElementById("tokenStatus");
  if (ghToken) {
    el.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i> Token conectado`;
  } else {
    el.innerHTML = `<i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400"></i> Sem token — conecte para salvar`;
  }
  refreshIcons();
}

async function refreshMapFromGithub() {
  if (!ghToken) return;
  try {
    await loadImageMap();
    applyMapToLocalData();
    renderGrid();
  } catch (err) {
    console.error(err);
    toast(`Não foi possível ler o repositório: ${err.message}`, "error");
  }
}

function applyMapToLocalData() {
  [BAU_ITEMS, PARTS, MOLDES_CNC].forEach((list) => {
    list.forEach((item) => {
      if (imageMap[item.id]) item.imagem = rawUrl(imageMap[item.id]);
    });
  });
}

function rawUrl(path) {
  return `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${path}?t=${Date.now()}`;
}

/* --------------------------- Gestão de usuários -------------------------- */

async function loadSessionInfo() {
  try {
    const res = await fetch("/api/me", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      currentUserId = data.id;
      currentUsername = data.username;
    }
  } catch {
    /* auth-guard.js já cuida do redirect se a sessão cair */
  }
}

async function loadUsers() {
  const list = document.getElementById("usersList");
  list.innerHTML = `<p class="text-sm text-gray-500 py-4">Carregando...</p>`;
  try {
    const res = await fetch("/api/users", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      list.innerHTML = `<p class="text-sm text-red-400 py-4">${data.error || "Erro ao carregar usuários."}</p>`;
      return;
    }
    renderUsersList(data.users || []);
  } catch {
    list.innerHTML = `<p class="text-sm text-red-400 py-4">Erro ao carregar usuários.</p>`;
  }
}

function renderUsersList(users) {
  const list = document.getElementById("usersList");
  if (!users.length) {
    list.innerHTML = `<p class="text-sm text-gray-500 py-4">Nenhum usuário cadastrado.</p>`;
    return;
  }

  list.innerHTML = users.map((u) => {
    const isSelf = u.id === currentUserId;
    const created = new Date(u.created_at).toLocaleDateString("pt-BR");
    const label = u.display_name ? `${u.display_name} <span class="text-gray-500">(${u.username})</span>` : u.username;
    const roleText = u.role ? u.role : "Sem cargo definido";
    return `
    <div class="flex items-center justify-between gap-3 border border-border rounded-lg px-4 py-3 bg-card">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-white truncate">${label}${isSelf ? ' <span class="text-xs text-accentlight">(você)</span>' : ""}</p>
        <p class="text-xs text-gray-500 truncate">${roleText} · Criado em ${created}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button class="icon-btn" title="Editar cargo" onclick="editUserRole(${u.id}, '${u.username}', ${u.role ? `'${u.role.replace(/'/g, "\\'")}'` : "null"})"><i data-lucide="briefcase" class="w-3.5 h-3.5"></i></button>
        <button class="icon-btn" title="Trocar senha" onclick="resetUserPassword(${u.id}, '${u.username}')"><i data-lucide="key-round" class="w-3.5 h-3.5"></i></button>
        <button class="icon-btn" title="Excluir" ${isSelf ? "disabled" : ""} onclick="deleteUser(${u.id}, '${u.username}')"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>
    </div>`;
  }).join("");

  refreshIcons();
}

async function createUser(e) {
  e.preventDefault();

  const usernameInput = document.getElementById("newUsername");
  const passwordInput = document.getElementById("newPassword");
  const confirmInput = document.getElementById("newPasswordConfirm");
  const roleInput = document.getElementById("newRole");
  const errorEl = document.getElementById("createUserError");
  errorEl.classList.add("hidden");

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const confirm = confirmInput.value;
  const role = roleInput.value.trim();

  if (password !== confirm) {
    errorEl.textContent = "As senhas não coincidem.";
    errorEl.classList.remove("hidden");
    return;
  }

  const btn = document.getElementById("createUserBtn");
  btn.disabled = true;
  btn.textContent = "Criando...";

  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password, role }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      errorEl.textContent = data.error || "Erro ao criar usuário.";
      errorEl.classList.remove("hidden");
      return;
    }

    usernameInput.value = "";
    passwordInput.value = "";
    confirmInput.value = "";
    roleInput.value = "";
    toast(`Usuário "${data.user.username}" criado.`, "success");
    loadUsers();
  } catch {
    errorEl.textContent = "Erro ao criar usuário. Tente novamente.";
    errorEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "Criar usuário";
  }
}

async function deleteUser(id, username) {
  if (!confirm(`Excluir o usuário "${username}"? Essa ação não pode ser desfeita.`)) return;

  try {
    const res = await fetch(`/api/users?id=${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Erro ao excluir usuário.", "error");
      return;
    }
    toast(`Usuário "${username}" excluído.`, "success");
    loadUsers();
  } catch {
    toast("Erro ao excluir usuário.", "error");
  }
}

async function resetUserPassword(id, username) {
  const newPassword = prompt(`Nova senha para "${username}" (mínimo 8 caracteres):`);
  if (!newPassword) return;
  if (newPassword.length < 8) {
    toast("A senha precisa ter pelo menos 8 caracteres.", "error");
    return;
  }

  try {
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, password: newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Erro ao trocar senha.", "error");
      return;
    }
    toast(`Senha de "${username}" atualizada.`, "success");
  } catch {
    toast("Erro ao trocar senha.", "error");
  }
}

async function editUserRole(id, username, currentRole) {
  const newRole = prompt(`Cargo de "${username}" (deixe vazio para remover):`, currentRole || "");
  if (newRole === null) return; // cancelou

  try {
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, role: newRole.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Erro ao atualizar cargo.", "error");
      return;
    }
    toast(`Cargo de "${username}" atualizado.`, "success");
    loadUsers();
  } catch {
    toast("Erro ao atualizar cargo.", "error");
  }
}

/* -------------------------------- Render --------------------------------- */

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".admin-tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));

  const isUsersTab = tab === "usuarios";
  document.getElementById("imagesPanel").classList.toggle("hidden", isUsersTab);
  document.getElementById("imagesSearchWrap").classList.toggle("hidden", isUsersTab);
  document.getElementById("adminCount").classList.toggle("hidden", isUsersTab);
  document.getElementById("usersPanel").classList.toggle("hidden", !isUsersTab);

  if (isUsersTab) {
    loadUsers();
  } else {
    renderGrid();
  }
}

function statusBadge(id) {
  const s = cardStatus[id];
  if (s === "saving") return `<span class="admin-status saving"><i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Salvando...</span>`;
  if (s === "saved") return `<span class="admin-status saved"><i data-lucide="check" class="w-3 h-3"></i> Salvo</span>`;
  if (s === "error") return `<span class="admin-status error" title="${cardErrors[id] || ""}"><i data-lucide="x" class="w-3 h-3"></i> Erro</span>`;
  return "";
}

function renderGrid() {
  const tab = TABS[activeTab];
  if (!tab) return;
  const grid = document.getElementById("adminGrid");
  const items = tab.items().filter((it) => it.nome.toLowerCase().includes(searchQuery.toLowerCase()));

  document.getElementById("adminCount").textContent = `${items.length} ${items.length === 1 ? "item" : "itens"}`;

  if (!items.length) {
    grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-16">Nenhum item encontrado.</p>`;
    return;
  }

  grid.innerHTML = items.map((item) => {
    const hasImg = !!item.imagem;
    const visual = hasImg
      ? `<img src="${item.imagem}" alt="${item.nome}" class="admin-card-img" onerror="this.style.display='none';" />`
      : `<i data-lucide="${tab.iconFor(item)}" class="admin-card-icon"></i>`;
    return `
    <div class="admin-card" data-id="${item.id}">
      <label class="admin-card-drop" for="file-${item.id}">
        ${visual}
        <div class="admin-card-overlay">
          <i data-lucide="upload" class="w-5 h-5"></i>
          <span>Trocar imagem</span>
        </div>
      </label>
      <input type="file" id="file-${item.id}" accept="image/*" class="hidden" onchange="handleFileForItem(getItemRef('${activeTab}','${item.id}'), '${activeTab}', this.files[0])" />
      <div class="admin-card-body">
        <p class="admin-card-name" title="${item.nome}">${item.nome}</p>
        <p class="admin-card-cat">${item.categoria || tab.label}</p>
        <div class="admin-card-foot">
          ${statusBadge(item.id)}
          ${hasImg ? `<button class="admin-remove-btn" onclick="handleRemoveImage(getItemRef('${activeTab}','${item.id}'))" title="Remover imagem"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` : ""}
        </div>
      </div>
    </div>`;
  }).join("");

  refreshIcons();
  attachDropHandlers();
}

function getItemRef(tabKey, id) {
  return TABS[tabKey].items().find((i) => i.id === id);
}

function attachDropHandlers() {
  document.querySelectorAll(".admin-card-drop").forEach((drop) => {
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("dragover"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("dragover"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const id = drop.closest(".admin-card").dataset.id;
      const item = getItemRef(activeTab, id);
      handleFileForItem(item, activeTab, file);
    });
  });
}

/* -------------------------------- Início ---------------------------------- */

function startApp() {
  updateTokenStatus();
  refreshIcons();
  if (ghToken) refreshMapFromGithub();
  else openTokenPanel();
}

document.addEventListener("DOMContentLoaded", () => {
  refreshIcons();

  document.querySelectorAll(".admin-tab").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
  document.getElementById("adminSearch").addEventListener("input", (e) => { searchQuery = e.target.value; renderGrid(); });

  document.getElementById("tokenSaveBtn").addEventListener("click", saveToken);
  document.getElementById("tokenClearBtn").addEventListener("click", clearToken);
  document.getElementById("tokenCloseBtn").addEventListener("click", closeTokenPanel);
  document.getElementById("openTokenBtn").addEventListener("click", openTokenPanel);
  document.getElementById("refreshBtn").addEventListener("click", () => { toast("Sincronizando com o GitHub..."); refreshMapFromGithub(); });
  document.getElementById("createUserForm").addEventListener("submit", createUser);

  loadSessionInfo();
  startApp();
});
