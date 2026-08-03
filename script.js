/* ==========================================================================
   ANDRADE GARAGE — script.js
   Toda a lógica da aplicação: navegação, renderização, busca, filtros,
   CRUD do Baú, catálogo de Peças (com drill-down de peças forjadas) e
   catálogo de Moldes CNC.
   ========================================================================== */

// Cópia mutável do estoque (para permitir "restaurar dados").
// Importante: essa cópia só é criada DEPOIS que loadImageOverrides() aplica
// o assets/image-map.json em BAU_ITEMS — senão as imagens do Baú vindas do
// Admin nunca aparecem, mesmo já estando corretas em BAU_ITEMS.
let bauItems = [];

// Estado da UI
const state = {
  currentPage: "dashboard",
  bau: { search: "", category: "Todos", sort: "none" },
  forjados: { search: "", view: "categories", activeCategory: null },
  moldes: { search: "" },
  loja: { search: "", category: "Todos" },
  order: {}, // seleção de itens da Loja para gerar uma Ordem de Serviço { [id]: {id,nome,categoria,valor,qtd} }
  orderHistory: [], // Ordens de Serviço já confirmadas: { numero, data, itens[], total }
  orderCounter: 0, // último número de OS emitido
  forgeCart: {}, // seleção de peças (aba Peças) pra forjar em lote: { [partId]: qtd }
  forgeQty: 1, // quantidade selecionada para "Forjar com 1 clique" no modal de detalhes
  editingItemId: null,
  detailStack: [], // pilha de navegação do modal de detalhes { type: 'parte'|'molde', id }
  profile: null, // { id, username, displayName, avatarData, role } — vem de /api/me
};

const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral da oficina" },
  bau: { title: "Baú", subtitle: "Controle completo do estoque de materiais" },
  forjados: { title: "Peças", subtitle: "Catálogo completo de peças da oficina, organizado por sistema" },
  moldescnc: { title: "Moldes CNC", subtitle: "Peças brutas usinadas, usadas como base para forjar componentes" },
  loja: { title: "Peças LOJA", subtitle: "Peças compradas prontas de fornecedores externos — não são fabricadas na oficina" },
  configuracoes: { title: "Configurações", subtitle: "Preferências do sistema" },
  perfil: { title: "Perfil", subtitle: "Suas informações de conta" },
};

/* ============================================================ helpers === */

function fmtDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getItemById(id) {
  return bauItems.find((i) => i.id === id);
}

function findBauItemByName(nome) {
  return bauItems.find((i) => i.nome.toLowerCase() === nome.toLowerCase());
}

// Tema visual (cor + ícone) por tipo de material, usado nos "slots" do Baú
const MATERIAL_THEME = {
  cobre:    { color: "#e0955f" },
  ferro:    { color: "#a9adb3" },
  aco:      { color: "#8fb0d6" },
  prata:    { color: "#e7e9ec" },
  titanio:  { color: "#eab308" },
  aluminio: { color: "#cbd5e1" },
};

function materialKeyFromName(nome) {
  const n = nome.toLowerCase();
  if (n.includes("cobre")) return "cobre";
  if (n.includes("ferro")) return "ferro";
  if (n.includes("aço") || n.includes("aco")) return "aco";
  if (n.includes("prata")) return "prata";
  if (n.includes("titânio") || n.includes("titanio")) return "titanio";
  if (n.includes("alumínio") || n.includes("aluminio")) return "aluminio";
  return "default";
}

function getBauItemVisual(item) {
  const key = materialKeyFromName(item.nome);
  const theme = MATERIAL_THEME[key] || { color: "#9d5cff" };
  let icon = "gem";
  if (item.categoria === "Barras") icon = "rectangle-horizontal";
  else if (item.categoria === "Barras Refinadas") {
    icon = item.nome.toLowerCase().includes("fio") ? "cable" : "sparkles";
  }
  return { color: theme.color, icon };
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function badgeClassForCategory(cat) {
  switch (cat) {
    case "Minérios": return "badge-minerios";
    case "Barras": return "badge-barras";
    case "Barras Refinadas": return "badge-refinadas";
    default: return "badge-custom";
  }
}

// Categorias fixas do fluxo de forja (Minérios → Barras → Barras Refinadas)
// + quaisquer classificações novas que o usuário criar ao adicionar itens.
function getDistinctBauCategories() {
  const fixas = ["Minérios", "Barras", "Barras Refinadas"];
  const extras = [...new Set(bauItems.map((i) => i.categoria))]
    .filter((c) => c && !fixas.includes(c))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  return [...fixas, ...extras];
}

function populateCategoriaDatalist() {
  const list = document.getElementById("itemCategoriaList");
  if (!list) return;
  list.innerHTML = getDistinctBauCategories().map((c) => `<option value="${c}"></option>`).join("");
}

function renderBauCategoryFilters() {
  const wrap = document.getElementById("bauCategoryFilters");
  if (!wrap) return;
  const current = state.bau.category;
  const cats = getDistinctBauCategories();
  wrap.innerHTML = [
    `<button data-cat="Todos" class="filter-pill ${current === "Todos" ? "active" : ""}">Todos</button>`,
    ...cats.map((c) => `<button data-cat="${c}" class="filter-pill ${current === c ? "active" : ""}">${c}</button>`),
  ].join("");
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function showToast(message, icon = "check-circle-2") {
  const toast = document.getElementById("toast");
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 text-accentlight"></i><span>${message}</span>`;
  toast.classList.remove("hidden");
  requestAnimationFrame(() => toast.classList.add("show"));
  refreshIcons();
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 250);
  }, 2600);
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

/* ================================================================== nav === */

function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll(".page-section").forEach((el) => el.classList.add("hidden"));
  document.getElementById(`page-${page}`).classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  document.getElementById("pageTitle").textContent = PAGE_META[page].title;
  document.getElementById("pageSubtitle").textContent = PAGE_META[page].subtitle;

  closeMobileSidebar();

  if (page === "dashboard") renderDashboard();
  if (page === "bau") renderBauPage();
  if (page === "forjados") renderForjadosPage();
  if (page === "moldescnc") renderMoldesPage();
  if (page === "loja") renderLojaPage();
  if (page === "configuracoes") renderConfiguracoes();
  if (page === "perfil") renderPerfilPage();
}

function closeMobileSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.add("hidden");
}

/* ============================================================ estoque === */

// Verifica apenas os materiais "diretos" (não forjados) de uma lista de
// materiais contra o Baú. Itens forjados (sub-peças ou moldes) não entram
// nessa checagem — eles são produzidos separadamente.
function checkDirectStock(materiais) {
  const missing = [];
  materiais.forEach((m) => {
    if (m.forjada) return;
    const item = findBauItemByName(m.nome);
    if (item && item.quantidade < m.quantidade) {
      missing.push({
        nome: m.nome,
        necessario: m.quantidade,
        disponivel: item.quantidade,
        faltam: m.quantidade - item.quantidade,
      });
    }
  });
  return { canMake: missing.length === 0, missing };
}

/* ========================================================== dashboard === */

function fmtMoney(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function computePodeForjarCount() {
  return PARTS.filter((p) => checkDirectStock(p.materiais).canMake).length;
}

// Valor total do estoque do Baú (quantidade × preço de mercado de cada item)
function computeValorTotalEstoque() {
  return bauItems.reduce((soma, item) => soma + item.quantidade * getPreco(item.nome), 0);
}

// Minério (categoria "Minérios") com a maior quantidade em estoque
function computeMinerioMaisAbundante() {
  const minerios = bauItems.filter((i) => i.categoria === "Minérios");
  if (!minerios.length) return null;
  return minerios.reduce((max, i) => (i.quantidade > max.quantidade ? i : max), minerios[0]);
}

// Item do Baú com a menor quantidade em estoque (o mais raro/escasso)
function computeMaterialMaisRaro() {
  if (!bauItems.length) return null;
  return bauItems.reduce((min, i) => (i.quantidade < min.quantidade ? i : min), bauItems[0]);
}

// Barras cujo minério de origem tem estoque suficiente para forjar mais uma unidade agora
function computeBarrasForjaveisAgora() {
  const barras = bauItems.filter((i) => i.categoria === "Barras");
  return barras.filter((barra) => {
    const nomeMinerio = barra.nome.replace(/^Barra de\s+/i, "").trim();
    const minerio = bauItems.find((i) => i.categoria === "Minérios" && i.nome === nomeMinerio);
    return minerio && minerio.quantidade > 0;
  });
}

// Itens do Baú abaixo do estoque mínimo definido
function computeEstoqueAbaixoMinimo() {
  return bauItems.filter((i) => typeof i.estoqueMinimo === "number" && i.quantidade < i.estoqueMinimo);
}

function renderDashboard() {
  document.getElementById("statPecas").textContent = PARTS.length;
  document.getElementById("statItensBau").textContent = bauItems.reduce((sum, i) => sum + i.quantidade, 0);
  document.getElementById("statPodeForjar").textContent = `${computePodeForjarCount()} / ${PARTS.length}`;

  const latest = bauItems.reduce((acc, i) => (i.ultimaAtualizacao > acc ? i.ultimaAtualizacao : acc), "0000-00-00");
  document.getElementById("statUltimaAtualizacao").textContent = fmtDate(latest);
  document.getElementById("statTotalMateriais").textContent = bauItems.length;

  // ---- Dashboard Inteligente ----
  document.getElementById("statValorEstoque").textContent = fmtMoney(computeValorTotalEstoque());

  const minerioTop = computeMinerioMaisAbundante();
  document.getElementById("statMinerioAbundante").textContent = minerioTop ? minerioTop.nome : "—";
  document.getElementById("statMinerioAbundanteSub").textContent = minerioTop ? `${minerioTop.quantidade} un` : "";

  const materialRaro = computeMaterialMaisRaro();
  document.getElementById("statMaterialRaro").textContent = materialRaro ? materialRaro.nome : "—";
  document.getElementById("statMaterialRaroSub").textContent = materialRaro ? `${materialRaro.quantidade} un` : "";

  const barrasForjaveis = computeBarrasForjaveisAgora();
  const totalBarras = bauItems.filter((i) => i.categoria === "Barras").length;
  document.getElementById("statBarrasForjaveis").textContent = `${barrasForjaveis.length} / ${totalBarras}`;

  const abaixoMinimo = computeEstoqueAbaixoMinimo();
  document.getElementById("statAbaixoMinimo").textContent = abaixoMinimo.length;

  // Avisos
  const iconMap = { alerta: "alert-triangle", info: "info", sucesso: "check-circle-2" };
  document.getElementById("noticesList").innerHTML = GARAGE_NOTICES.map((n) => `
    <div class="notice-card notice-${n.tipo}">
      <div class="notice-icon"><i data-lucide="${iconMap[n.tipo]}" class="w-4 h-4"></i></div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold text-white">${n.titulo}</p>
          <span class="text-[11px] text-gray-500 shrink-0">${fmtDate(n.data)}</span>
        </div>
        <p class="text-sm text-gray-400 mt-0.5">${n.mensagem}</p>
      </div>
    </div>
  `).join("");

  // Breakdown por categoria
  const categories = ["Minérios", "Barras", "Barras Refinadas"];
  const totalGeral = bauItems.reduce((s, i) => s + i.quantidade, 0) || 1;
  document.getElementById("dashCategoryBreakdown").innerHTML = categories.map((cat) => {
    const items = bauItems.filter((i) => i.categoria === cat);
    const total = items.reduce((s, i) => s + i.quantidade, 0);
    const pct = Math.round((total / totalGeral) * 100);
    return `
      <div>
        <div class="flex items-center justify-between text-sm mb-1.5">
          <span class="text-gray-300 font-medium">${cat}</span>
          <span class="text-gray-500">${total} un · ${items.length} itens</span>
        </div>
        <div class="qty-bar-track w-full h-2">
          <div class="qty-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join("");

  // Estoque abaixo do mínimo definido para cada item
  const low = computeEstoqueAbaixoMinimo().sort((a, b) => a.quantidade - b.quantidade);
  document.getElementById("dashLowStock").innerHTML = low.length
    ? low.map((i) => `
        <div class="flex items-center justify-between text-sm py-1.5 border-b border-[#26282c] last:border-0">
          <span class="text-gray-300">${i.nome}</span>
          <span class="text-amber-400 font-semibold">${i.quantidade} / ${i.estoqueMinimo} un</span>
        </div>`).join("")
    : `<p class="text-sm text-gray-500">Nenhum material abaixo do estoque mínimo.</p>`;

  refreshIcons();
}

/* ================================================================= baú === */

function getFilteredBauItems() {
  let items = [...bauItems];
  const { search, category, sort } = state.bau;

  if (category !== "Todos") items = items.filter((i) => i.categoria === category);
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter((i) => i.nome.toLowerCase().includes(q));
  }
  if (sort === "qty-desc") items.sort((a, b) => b.quantidade - a.quantidade);
  if (sort === "qty-asc") items.sort((a, b) => a.quantidade - b.quantidade);
  if (sort === "az") items.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return items;
}

function renderBauPage() {
  renderBauCategoryFilters();
  const items = getFilteredBauItems();
  const grid = document.getElementById("bauGrid");
  const empty = document.getElementById("bauEmptyState");

  if (!items.length) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
    const maxQty = Math.max(...bauItems.map((i) => i.quantidade), 1);
    grid.innerHTML = items.map((item) => {
      const visual = getBauItemVisual(item);
      const pct = Math.min(100, (item.quantidade / maxQty) * 100);
      const bg = `radial-gradient(circle at 30% 20%, rgba(124,58,237,0.12), transparent 65%), linear-gradient(160deg, #1c1d21 0%, #131316 100%)`;
      const visualContent = item.imagem
        ? `<img src="${item.imagem}" alt="${item.nome}" class="bau-item-photo" onerror="this.style.display='none';" />`
        : `<i data-lucide="${visual.icon}" class="bau-item-icon"></i>`;
      return `
      <div class="bau-item-card" title="Última atualização: ${fmtDate(item.ultimaAtualizacao)}">
        <div class="bau-item-actions">
          <button class="icon-btn" title="Editar" onclick="openItemModal('${item.id}')"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
          <button class="icon-btn danger" title="Remover" onclick="deleteItem('${item.id}')"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
        <div class="bau-item-visual" style="--mat-color:${visual.color}; background:${bg};">
          ${visualContent}
          <span class="bau-item-qty">${item.quantidade}x</span>
        </div>
        <div class="bau-item-body">
          <p class="bau-item-name" title="${item.nome}">${item.nome}</p>
          <span class="category-badge bau-item-catbadge ${badgeClassForCategory(item.categoria)}">${item.categoria}</span>
          <div class="qty-bar-track w-full mt-2"><div class="qty-bar-fill" style="width:${pct}%"></div></div>
        </div>
      </div>
      `;
    }).join("");
  }
  refreshIcons();
}

function openItemModal(id = null) {
  state.editingItemId = id;
  const title = document.getElementById("itemModalTitle");
  const form = document.getElementById("itemForm");
  form.reset();
  populateCategoriaDatalist();

  if (id) {
    const item = getItemById(id);
    title.textContent = "Editar Item";
    document.getElementById("itemId").value = item.id;
    document.getElementById("itemNome").value = item.nome;
    document.getElementById("itemCategoria").value = item.categoria;
    document.getElementById("itemQuantidade").value = item.quantidade;
  } else {
    title.textContent = "Adicionar Item";
    document.getElementById("itemId").value = "";
  }
  openModal("itemModal");
}

function saveItemForm(e) {
  e.preventDefault();
  const id = document.getElementById("itemId").value;
  const nome = document.getElementById("itemNome").value.trim();
  const categoria = document.getElementById("itemCategoria").value.trim();
  const quantidade = parseInt(document.getElementById("itemQuantidade").value, 10) || 0;

  if (id) {
    const item = getItemById(id);
    item.nome = nome;
    item.categoria = categoria;
    item.quantidade = quantidade;
    item.ultimaAtualizacao = todayStr();
    showToast("Item atualizado com sucesso");
  } else {
    bauItems.push({
      id: slugify(nome) + "-" + Date.now().toString().slice(-4),
      nome, categoria, quantidade,
      ultimaAtualizacao: todayStr(),
    });
    showToast("Item adicionado ao Baú");
  }
  closeModal("itemModal");
  renderBauPage();
  saveBauToServer();
  if (state.currentPage === "dashboard") renderDashboard();
  if (state.currentPage === "forjados") renderForjadosPage();
  if (state.currentPage === "moldescnc") renderMoldesPage();
}

function deleteItem(id) {
  const item = getItemById(id);
  if (!confirm(`Remover "${item.nome}" do Baú?`)) return;
  bauItems = bauItems.filter((i) => i.id !== id);
  showToast("Item removido do Baú", "trash-2");
  renderBauPage();
  saveBauToServer();
}

/* ================================================== importar baú (IA) === */
// Fluxo: escolher/soltar imagem → enviar pra /api/import-bau-image (Gemini
// Vision no backend) → o usuário revisa cada item detectado (pode editar
// nome/quantidade, desmarcar, ver o nível de confiança) → só ao confirmar
// é que os itens entram de fato no bauItems e são salvos no servidor.

function escapeAttr(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function normalizeItemName(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function findExistingBauItemByName(name) {
  const norm = normalizeItemName(name);
  if (!norm) return null;
  return bauItems.find((i) => normalizeItemName(i.nome) === norm) || null;
}

// Redimensiona o print pra um tamanho razoável antes de mandar pra IA
// (mais rápido de enviar, mais barato pra API, sem perder legibilidade).
function readAndResizeInventoryImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const scale = MAX / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

let importBauState = { phase: "idle", items: [], error: null };

function openImportBauModal() {
  importBauState = { phase: "idle", items: [], error: null };
  renderImportBauModal();
  openModal("importBauModal");
}

function renderImportBauModal() {
  const body = document.getElementById("importBauBody");
  if (!body) return;

  if (importBauState.phase === "idle") {
    body.innerHTML = `
      <div class="py-4">
        <div id="importDropzone" class="w-full border-2 border-dashed border-border rounded-xl py-10 px-6 text-center cursor-pointer hover:border-accent transition-colors duration-200">
          <i data-lucide="image-plus" class="w-8 h-8 mx-auto mb-3 text-gray-500"></i>
          <p class="text-sm text-gray-300 font-medium">Clique para escolher um print, ou arraste aqui</p>
          <p class="text-xs text-gray-500 mt-1">PNG, JPG ou WEBP · a imagem é redimensionada automaticamente</p>
        </div>
        <input id="importFileInput" type="file" accept="image/*" class="hidden" />
      </div>`;
    wireImportDropzone();
  } else if (importBauState.phase === "loading") {
    body.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-4 py-14">
        <div class="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-400">Analisando a imagem com IA...</p>
      </div>`;
  } else if (importBauState.phase === "error") {
    body.innerHTML = `
      <div class="text-center py-10">
        <i data-lucide="alert-triangle" class="w-8 h-8 mx-auto mb-3 text-red-400"></i>
        <p class="text-sm text-gray-300 mb-5 max-w-sm mx-auto">${escapeAttr(importBauState.error)}</p>
        <button id="importRetryBtn" type="button" class="btn-secondary mx-auto">Tentar de novo</button>
      </div>`;
    document.getElementById("importRetryBtn").addEventListener("click", () => {
      importBauState = { phase: "idle", items: [], error: null };
      renderImportBauModal();
    });
  } else if (importBauState.phase === "review") {
    body.innerHTML = renderImportReviewHtml();
    wireImportReviewControls();
  }
  refreshIcons();
}

function wireImportDropzone() {
  const zone = document.getElementById("importDropzone");
  const input = document.getElementById("importFileInput");
  if (!zone || !input) return;

  zone.addEventListener("click", () => input.click());
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("border-accent"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("border-accent"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("border-accent");
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleImportFile(file);
  });
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) handleImportFile(file);
  });
}

async function handleImportFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("Escolha um arquivo de imagem válido.", "alert-circle");
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    showToast("Imagem muito grande. Escolha um arquivo de até 15MB.", "alert-circle");
    return;
  }

  importBauState = { phase: "loading", items: [], error: null };
  renderImportBauModal();

  try {
    const dataUrl = await readAndResizeInventoryImage(file);
    const res = await fetch("/api/import-bau-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ image: dataUrl }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.error || "Não foi possível analisar a imagem.");

    const detected = Array.isArray(data.items) ? data.items : [];
    if (!detected.length) {
      importBauState = {
        phase: "error", items: [],
        error: data.warning || "Nenhum item foi identificado nessa imagem. Tente um print mais nítido do baú.",
      };
      renderImportBauModal();
      return;
    }

    importBauState = {
      phase: "review",
      error: null,
      items: detected.map((it) => {
        const matched = findExistingBauItemByName(it.name);
        return {
          name: it.name,
          quantity: it.quantity,
          confidence: it.confidence,
          position: it.position,
          selected: true,
          matchedId: matched ? matched.id : null,
          currentQty: matched ? matched.quantidade : null,
        };
      }),
    };
    renderImportBauModal();
  } catch (err) {
    importBauState = { phase: "error", items: [], error: err.message || "Erro ao analisar a imagem." };
    renderImportBauModal();
  }
}

function importRowStatusText(row) {
  if (row.matchedId) {
    const base = `Já existe no Baú (${row.currentQty ?? "?"}) — quantidade será <strong class="text-white">substituída</strong> por ${row.quantity}`;
    return base + (row.position ? ` · ${escapeAttr(row.position)}` : "");
  }
  const base = "Não encontrado no Baú — será adicionado como item novo";
  return base + (row.position ? ` · ${escapeAttr(row.position)}` : "");
}

function renderImportReviewHtml() {
  const rows = importBauState.items.map((row, i) => {
    const pct = Math.round((row.confidence ?? 0) * 100);
    const low = (row.confidence ?? 0) < 0.6;
    const mid = !low && pct < 85;
    const badgeClass = low
      ? "text-red-400 bg-red-500/10 border-red-500/30"
      : mid
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

    return `
    <div class="flex items-start gap-3 border rounded-lg px-3 py-2.5 transition-colors duration-150 ${low ? "border-red-500/40 bg-red-500/5" : "border-border bg-base/40"}">
      <input type="checkbox" class="import-row-check mt-2.5 accent-accent shrink-0" data-index="${i}" ${row.selected ? "checked" : ""} />
      <div class="flex-1 min-w-0 space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <input type="text" class="import-row-name input-field !py-1.5 !text-sm flex-1 min-w-[130px]" data-index="${i}" value="${escapeAttr(row.name)}" />
          <input type="number" min="0" class="import-row-qty input-field !py-1.5 !text-sm !w-20" data-index="${i}" value="${row.quantity}" />
          <span class="text-[11px] px-2 py-0.5 rounded-full border ${badgeClass} shrink-0">${pct}% confiança</span>
          ${low ? '<span class="text-[11px] px-2 py-0.5 rounded-full border border-red-500/40 text-red-400 bg-red-500/10 shrink-0">Revisar</span>' : ""}
          <span class="import-row-badge text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${row.matchedId ? "text-gray-400 border-border bg-white/5" : "text-accentlight border-accent/40 bg-accent/10"}">${row.matchedId ? "Já existe" : "Novo item"}</span>
        </div>
        <p class="import-row-status text-[11px] text-gray-500">${importRowStatusText(row)}</p>
      </div>
    </div>`;
  }).join("");

  return `
    <div class="space-y-3">
      <p class="text-[11px] text-gray-500 bg-white/5 border border-border rounded-lg px-3 py-2">
        <i data-lucide="info" class="w-3 h-3 inline -mt-0.5 mr-1"></i>
        A imagem é tratada como o estado atual do baú no jogo: para itens já existentes, a quantidade do site será <strong class="text-gray-300">substituída</strong> pela quantidade lida — não somada.
      </p>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="importSelectAll" checked class="accent-accent" /> Selecionar todos (${importBauState.items.length})
        </label>
        <button id="importAnalyzeAgainBtn" type="button" class="text-accentlight hover:text-white transition-colors duration-150">Analisar outra imagem</button>
      </div>
      <div class="space-y-2 max-h-[42vh] overflow-y-auto pr-1">${rows}</div>
      <div class="flex gap-3 pt-3 border-t border-border">
        <button type="button" data-close-modal="importBauModal" class="btn-secondary flex-1">Cancelar</button>
        <button id="importConfirmBtn" type="button" class="btn-primary flex-1 justify-center">Importar selecionados</button>
      </div>
    </div>`;
}

function wireImportReviewControls() {
  document.querySelectorAll(".import-row-check").forEach((el) => {
    el.addEventListener("change", (e) => {
      importBauState.items[+e.target.dataset.index].selected = e.target.checked;
    });
  });

  document.querySelectorAll(".import-row-name").forEach((el) => {
    el.addEventListener("input", (e) => {
      const i = +e.target.dataset.index;
      const row = importBauState.items[i];
      row.name = e.target.value;
      const matched = findExistingBauItemByName(row.name);
      row.matchedId = matched ? matched.id : null;
      row.currentQty = matched ? matched.quantidade : null;

      const wrap = el.closest(".flex-1");
      const statusEl = wrap?.querySelector(".import-row-status");
      if (statusEl) statusEl.innerHTML = importRowStatusText(row);
      const badgeEl = wrap?.querySelector(".import-row-badge");
      if (badgeEl) {
        badgeEl.textContent = row.matchedId ? "Já existe" : "Novo item";
        badgeEl.className = `import-row-badge text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${row.matchedId ? "text-gray-400 border-border bg-white/5" : "text-accentlight border-accent/40 bg-accent/10"}`;
      }
    });
  });

  document.querySelectorAll(".import-row-qty").forEach((el) => {
    el.addEventListener("input", (e) => {
      const i = +e.target.dataset.index;
      const row = importBauState.items[i];
      row.quantity = Math.max(0, parseInt(e.target.value, 10) || 0);
      const statusEl = el.closest(".flex-1")?.querySelector(".import-row-status");
      if (statusEl) statusEl.innerHTML = importRowStatusText(row);
    });
  });

  const selectAll = document.getElementById("importSelectAll");
  selectAll?.addEventListener("change", (e) => {
    importBauState.items.forEach((row) => (row.selected = e.target.checked));
    document.querySelectorAll(".import-row-check").forEach((el) => { el.checked = e.target.checked; });
  });

  document.getElementById("importAnalyzeAgainBtn")?.addEventListener("click", () => {
    importBauState = { phase: "idle", items: [], error: null };
    renderImportBauModal();
  });

  document.getElementById("importConfirmBtn")?.addEventListener("click", confirmImportBau);
}

function confirmImportBau() {
  const selected = importBauState.items.filter((row) => row.selected && row.name.trim());
  if (!selected.length) {
    showToast("Selecione ao menos um item pra importar.", "alert-circle");
    return;
  }

  let addedCount = 0;
  let updatedCount = 0;

  selected.forEach((row, idx) => {
    const qty = Math.max(0, Math.round(row.quantity) || 0);
    const existing = row.matchedId ? bauItems.find((i) => i.id === row.matchedId) : findExistingBauItemByName(row.name);

    if (existing) {
      // O print representa o estado atual do baú no jogo — a quantidade
      // lida SUBSTITUI a quantidade salva, nunca soma em cima dela.
      existing.quantidade = qty;
      existing.ultimaAtualizacao = todayStr();
      updatedCount++;
      return;
    }

    bauItems.push({
      id: `${slugify(row.name.trim())}-${Date.now().toString().slice(-4)}-${idx}`,
      nome: row.name.trim(),
      categoria: "Importado via IA",
      quantidade: qty,
      ultimaAtualizacao: todayStr(),
    });
    addedCount++;
  });

  closeModal("importBauModal");
  renderBauPage();
  saveBauToServer();
  if (state.currentPage === "dashboard") renderDashboard();

  const parts = [];
  if (updatedCount) parts.push(`${updatedCount} atualizado${updatedCount > 1 ? "s" : ""}`);
  if (addedCount) parts.push(`${addedCount} novo${addedCount > 1 ? "s" : ""}`);
  showToast(`Baú importado: ${parts.join(", ")}.`);
}

/* ================================================================ peças === */

function getGroupedParts(query) {
  const q = query.trim().toLowerCase();
  return PARTS_CATEGORIES.map((cat) => {
    let items = PARTS.filter((p) => p.categoria === cat);
    if (q) {
      items = items.filter((p) =>
        p.nome.toLowerCase().includes(q) || (p.subtitulo || "").toLowerCase().includes(q)
      );
    }
    return { categoria: cat, items };
  }).filter((g) => g.items.length);
}

function openForjadosCategory(cat) {
  state.forjados.activeCategory = cat;
  state.forjados.view = "category";
  document.getElementById("forjadosSearch").value = "";
  state.forjados.search = "";
  renderForjadosPage();
}

function backToCategories() {
  state.forjados.view = "categories";
  state.forjados.activeCategory = null;
  renderForjadosPage();
}

function renderCategoryTile(cat) {
  const items = PARTS.filter((p) => p.categoria === cat);
  return `
  <button type="button" class="category-tile" onclick="openForjadosCategory('${cat}')">
    <div class="category-tile-icon"><i data-lucide="${CATEGORY_ICONS[cat] || "wrench"}" class="w-5 h-5"></i></div>
    <div>
      <p class="category-tile-title">${cat}</p>
      <p class="category-tile-count">${items.length} ${items.length === 1 ? "peça" : "peças"}</p>
    </div>
  </button>`;
}

function partRowCard(p) {
  const { canMake } = checkDirectStock(p.materiais);
  const hasForjada = p.materiais.some((m) => m.forjada);
  const selected = !!state.forgeCart[p.id];
  const imageContent = p.imagem
    ? `<img src="${p.imagem}" alt="${p.nome}" class="part-row-photo" loading="lazy" onerror="this.style.display='none'" />`
    : `<i data-lucide="${CATEGORY_ICONS[p.categoria] || "wrench"}" class="w-7 h-7 opacity-90"></i>`;
  return `
  <div class="part-row-card ${selected ? "is-selected" : ""}" role="button" tabindex="0"
    onclick="openDetailModal('parte','${p.id}')"
    onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openDetailModal('parte','${p.id}');}">
    <label class="row-select" title="Selecionar para a Ordem de Serviço" onclick="event.stopPropagation()">
      <input type="checkbox" data-forge-id="${p.id}" ${selected ? "checked" : ""}
        onchange="toggleForgeCartItem('${p.id}', this.checked, this)" />
    </label>
    <div class="part-row-image">
      ${imageContent}
      <span class="part-row-blur"></span>
    </div>
    <div class="part-row-body">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-bold text-white truncate">${p.nome}</p>
        <span class="status-pill ${canMake ? "status-ok" : "status-fail"} !text-[10px] !py-1 !px-2 shrink-0">
          <i data-lucide="${canMake ? "check-circle-2" : "x-circle"}" class="w-3 h-3"></i>
        </span>
      </div>
      ${p.subtitulo ? `<p class="text-[11px] text-gray-500 truncate">${p.subtitulo}</p>` : ""}
      <div class="flex items-center gap-2 mt-0.5">
        <span class="text-[10px] uppercase tracking-wide text-accentlight font-semibold">${p.categoria}</span>
        ${hasForjada ? `<span class="text-[10px] text-gray-500 flex items-center gap-1"><i data-lucide="hammer" class="w-2.5 h-2.5"></i>usa peça forjada</span>` : ""}
      </div>
    </div>
    <div class="part-row-chevron"><i data-lucide="chevron-right" class="w-4 h-4"></i></div>
  </div>`;
}

function renderCategoriesLevel(container) {
  container.innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      ${PARTS_CATEGORIES.map(renderCategoryTile).join("")}
    </div>`;
}

function renderCategoryLevel(container, cat) {
  const items = PARTS.filter((p) => p.categoria === cat);
  container.innerHTML = `
    <div class="flex items-center gap-3 mb-1">
      <button type="button" class="icon-btn" onclick="backToCategories()" title="Voltar para categorias">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
      </button>
      <div class="flex items-center gap-2">
        <p class="text-xs text-gray-500">Peças /</p>
        <h3 class="text-white font-bold text-base font-display flex items-center gap-1.5">
          <i data-lucide="${CATEGORY_ICONS[cat] || "wrench"}" class="w-4 h-4 text-accentlight"></i> ${cat}
        </h3>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      ${items.map(partRowCard).join("")}
    </div>`;
}

function renderSearchResultsLevel(container, query) {
  const groups = getGroupedParts(query);
  if (!groups.length) {
    container.innerHTML = "";
    return false;
  }
  container.innerHTML = groups.map((g) => `
    <section class="space-y-3">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center text-accentlight shrink-0">
          <i data-lucide="${CATEGORY_ICONS[g.categoria] || "wrench"}" class="w-3.5 h-3.5"></i>
        </div>
        <h3 class="text-white font-bold font-display text-base tracking-wide">${g.categoria}</h3>
        <span class="text-xs text-gray-500">${g.items.length} ${g.items.length === 1 ? "peça" : "peças"}</span>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        ${g.items.map(partRowCard).join("")}
      </div>
    </section>
  `).join("");
  return true;
}

function renderForjadosPage() {
  const container = document.getElementById("forjadosGrid");
  const empty = document.getElementById("forjadosEmptyState");
  const query = state.forjados.search;

  if (query.trim()) {
    const hasResults = renderSearchResultsLevel(container, query);
    empty.classList.toggle("hidden", hasResults);
    refreshIcons();
    return;
  }

  empty.classList.add("hidden");
  if (state.forjados.view === "category" && state.forjados.activeCategory) {
    renderCategoryLevel(container, state.forjados.activeCategory);
  } else {
    renderCategoriesLevel(container);
  }
  refreshIcons();
}

/* ================================================== OS de forja (lote) === */
// Selecionar várias peças na aba Peças, revisar uma lista ÚNICA e consolidada
// de materiais (somando os insumos repetidos entre as peças escolhidas), e só
// então debitar tudo do Baú de uma vez. Etapa de conferência obrigatória:
// o modal (#forgeOsModal) só fecha pelo botão FECHAR ou ENVIAR AO BAÚ — não
// por clique fora nem pela tecla ESC (ver wiring em initModals()).

function toggleForgeCartItem(id, checked, el) {
  if (checked) {
    if (!state.forgeCart[id]) state.forgeCart[id] = 1;
  } else {
    delete state.forgeCart[id];
  }
  const card = el ? el.closest(".part-row-card") : null;
  if (card) card.classList.toggle("is-selected", checked);
  updateForgeOsIndicator();
}

function updateForgeCartQty(id, delta) {
  const current = state.forgeCart[id];
  if (current === undefined) return;
  state.forgeCart[id] = Math.max(1, current + delta);
  updateForgeOsIndicator();
  renderForgeOsModalBody();
}

function removeForgeCartItem(id) {
  delete state.forgeCart[id];
  const cb = document.querySelector(`input[data-forge-id="${id}"]`);
  if (cb) {
    cb.checked = false;
    const card = cb.closest(".part-row-card");
    if (card) card.classList.remove("is-selected");
  }
  updateForgeOsIndicator();
  renderForgeOsModalBody();
}

function clearForgeCart() {
  state.forgeCart = {};
  document.querySelectorAll("input[data-forge-id]").forEach((cb) => {
    cb.checked = false;
    const card = cb.closest(".part-row-card");
    if (card) card.classList.remove("is-selected");
  });
  updateForgeOsIndicator();
}

function getForgeCartEntries() {
  return Object.entries(state.forgeCart)
    .map(([id, qtd]) => ({ part: PARTS.find((p) => p.id === id), qtd }))
    .filter((e) => e.part && e.qtd > 0);
}

// Expande recursivamente uma lista de materiais: se um material for uma
// "peça forjada" (uma sub-receita, ex: Bloco de Ferro Bruto dentro de Bloco
// de Ferro Fundido), em vez de ignorá-lo, entra na receita dela e soma os
// materiais REAIS que ela precisa — multiplicando pela quantidade em cada
// nível da cadeia. Assim a OS mostra o total de verdade que sai do Baú,
// mesmo quando uma peça depende de outra peça/molde pra ser feita.
function resolveRawMaterials(materiaisList, multiplier, acc, visited) {
  materiaisList.forEach((m) => {
    if (m.forjada && m.ref) {
      const refKey = `${m.ref.type}:${m.ref.id}`;
      if (visited.has(refKey)) return; // proteção contra receita circular
      const subData = getDetailData(m.ref);
      if (!subData || !Array.isArray(subData.materiais)) return;
      const nextVisited = new Set(visited);
      nextVisited.add(refKey);
      resolveRawMaterials(subData.materiais, multiplier * m.quantidade, acc, nextVisited);
      return;
    }
    if (!acc.has(m.nome)) {
      const bau = findBauItemByName(m.nome);
      acc.set(m.nome, { nome: m.nome, total: 0, disponivel: bau ? bau.quantidade : null });
    }
    acc.get(m.nome).total += m.quantidade * multiplier;
  });
}

// Consolida os materiais de TODAS as peças selecionadas numa lista única,
// somando os insumos repetidos (ex: 2x Motor V8 + 3x Caixa de Câmbio, ambos
// usando Barra de Aço, viram uma única linha "Barra de Aço — total somado"),
// já expandindo qualquer peça forjada aninhada até os materiais reais.
function computeForgeConsolidatedMaterials() {
  const acc = new Map();
  getForgeCartEntries().forEach(({ part, qtd }) => {
    resolveRawMaterials(part.materiais, qtd, acc, new Set());
  });
  return [...acc.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

function getForgeOsTotals() {
  const entries = getForgeCartEntries();
  const totalPecas = entries.reduce((s, e) => s + e.qtd, 0);
  const materiais = computeForgeConsolidatedMaterials();
  const totalMateriais = materiais.reduce((s, m) => s + m.total, 0);
  return { entries, totalPecas, materiais, totalMateriais };
}

function updateForgeOsIndicator() {
  const btn = document.getElementById("forgeOsBtn");
  const badge = document.getElementById("forgeOsBadge");
  if (!btn || !badge) return;
  const count = Object.keys(state.forgeCart).length;
  badge.textContent = String(count);
  badge.classList.toggle("hidden", count === 0);
  btn.classList.toggle("opacity-50", count === 0);
}

function forgeOsPartRow(entry) {
  const imageContent = entry.part.imagem
    ? `<img src="${entry.part.imagem}" alt="" class="w-full h-full object-cover" />`
    : `<i data-lucide="${CATEGORY_ICONS[entry.part.categoria] || "wrench"}" class="w-4 h-4 text-gray-500"></i>`;
  return `
  <div class="material-row justify-between !py-2">
    <div class="min-w-0 flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-base border border-border overflow-hidden shrink-0 flex items-center justify-center">
        ${imageContent}
      </div>
      <p class="text-sm text-gray-200 truncate">${entry.part.nome}</p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <div class="qty-stepper">
        <button type="button" title="Diminuir" onclick="updateForgeCartQty('${entry.part.id}', -1)">−</button>
        <span>${entry.qtd}</span>
        <button type="button" title="Aumentar" onclick="updateForgeCartQty('${entry.part.id}', 1)">+</button>
      </div>
      <button type="button" class="icon-btn danger" title="Remover da OS" onclick="removeForgeCartItem('${entry.part.id}')">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  </div>`;
}

function forgeOsMaterialRow(m) {
  const insuficiente = m.disponivel !== null && m.disponivel < m.total;
  return `
  <div class="material-row justify-between">
    <div class="min-w-0">
      <p class="text-sm font-semibold text-white truncate">${m.nome}</p>
      ${
        m.disponivel !== null
          ? `<p class="text-[11px] ${insuficiente ? "text-red-400" : "text-emerald-400"} mt-0.5">${m.disponivel} em estoque${insuficiente ? ` · faltam ${m.total - m.disponivel}` : ""}</p>`
          : `<p class="text-[11px] text-gray-600 mt-0.5">Não controlado no Baú</p>`
      }
    </div>
    <span class="text-lg font-bold ${insuficiente ? "text-red-400" : "text-white"} shrink-0">${m.total}</span>
  </div>`;
}

function renderForgeOsModalBody() {
  const body = document.getElementById("forgeOsModalBody");
  if (!body) return;

  const { entries, totalPecas, materiais, totalMateriais } = getForgeOsTotals();

  if (!entries.length) {
    body.innerHTML = `
      <div class="text-center py-14">
        <i data-lucide="clipboard-list" class="w-9 h-9 mx-auto mb-3 text-gray-600"></i>
        <p class="text-sm text-gray-500">Nenhuma peça selecionada ainda.</p>
        <p class="text-xs text-gray-600 mt-1">Feche esta OS e marque as peças que quer forjar na aba Peças.</p>
      </div>
      <div class="flex gap-3 pt-4 border-t border-border">
        <button type="button" onclick="closeModal('forgeOsModal')" class="btn-secondary flex-1">FECHAR</button>
        <button type="button" class="btn-primary flex-1 justify-center opacity-50 cursor-not-allowed" disabled>ENVIAR AO BAÚ</button>
      </div>`;
    refreshIcons();
    return;
  }

  const temInsuficiente = materiais.some((m) => m.disponivel !== null && m.disponivel < m.total);

  body.innerHTML = `
    <div class="space-y-5">
      <div>
        <h4 class="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
          Peças selecionadas · ${entries.length} ${entries.length === 1 ? "peça" : "peças"} (${totalPecas} un.)
        </h4>
        <div class="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          ${entries.map(forgeOsPartRow).join("")}
        </div>
      </div>

      <div class="border-t border-border pt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="package" class="w-4 h-4 text-accentlight"></i>
            Materiais necessários
          </h4>
          <span class="text-xs text-gray-500">
            ${materiais.length} ${materiais.length === 1 ? "item" : "itens"} ·
            <span class="text-white font-semibold">${totalMateriais}</span> un. no total
          </span>
        </div>
        <div class="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
          ${materiais.length ? materiais.map(forgeOsMaterialRow).join("") : `<p class="text-sm text-gray-500 text-center py-6">Essas peças não consomem materiais controlados no Baú.</p>`}
        </div>
        ${temInsuficiente ? `
        <p class="text-xs text-red-400 flex items-center gap-1.5 mt-3">
          <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0"></i>
          Baú sem estoque suficiente pra concluir esta OS — os itens em vermelho precisam ser repostos antes de enviar.
        </p>` : ""}
      </div>

      <div class="flex gap-3 pt-1 border-t border-border">
        <button type="button" onclick="closeModal('forgeOsModal')" class="btn-secondary flex-1">FECHAR</button>
        <button type="button" onclick="confirmForgeOs()" class="btn-primary flex-1 justify-center ${temInsuficiente ? "opacity-50 cursor-not-allowed" : ""}" ${temInsuficiente ? "disabled" : ""}>ENVIAR AO BAÚ</button>
      </div>
    </div>`;
  refreshIcons();
}

function openForgeOsModal() {
  if (!Object.keys(state.forgeCart).length) {
    showToast("Selecione ao menos uma peça na aba Peças pra montar a OS", "alert-triangle");
    return;
  }
  renderForgeOsModalBody();
  openModal("forgeOsModal");
}

// Envia a OS de verdade: debita todos os materiais consolidados do Baú de
// uma vez (tudo ou nada — se faltar algo, nada é debitado), limpa a
// seleção e fecha o modal.
function confirmForgeOs() {
  const { entries, materiais } = getForgeOsTotals();
  if (!entries.length) {
    showToast("Nenhuma peça selecionada.", "alert-circle");
    return;
  }

  const insuficientes = materiais.filter((m) => m.disponivel !== null && m.disponivel < m.total);
  if (insuficientes.length) {
    showToast(`Baú sem estoque suficiente: ${insuficientes.map((m) => m.nome).join(", ")}`, "x-circle");
    return;
  }

  materiais.forEach((m) => {
    const bau = findBauItemByName(m.nome);
    if (bau) {
      bau.quantidade = Math.max(0, bau.quantidade - m.total);
      bau.ultimaAtualizacao = todayStr();
    }
  });

  const totalPecas = entries.reduce((s, e) => s + e.qtd, 0);
  const resumo = entries.length === 1 ? entries[0].part.nome : `${entries.length} peças diferentes`;

  clearForgeCart();
  closeModal("forgeOsModal");
  saveBauToServer();
  if (state.currentPage === "dashboard") renderDashboard();
  if (state.currentPage === "bau") renderBauPage();
  if (state.currentPage === "forjados") renderForjadosPage();
  if (state.currentPage === "moldescnc") renderMoldesPage();

  showToast(`OS enviada ao Baú: ${resumo} (${totalPecas} un.) forjadas`, "hammer");
}

/* ============================================================ moldes cnc === */

function getFilteredMoldes() {
  const q = state.moldes.search.trim().toLowerCase();
  let items = [...MOLDES_CNC];
  if (q) items = items.filter((m) => m.nome.toLowerCase().includes(q));
  items.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return items;
}

function moldeRowCard(m) {
  const { canMake } = checkDirectStock(m.materiais);
  const imageContent = m.imagem
    ? `<img src="${m.imagem}" alt="${m.nome}" class="part-row-photo" loading="lazy" onerror="this.style.display='none'" />`
    : `<i data-lucide="drafting-compass" class="w-6 h-6 opacity-90"></i>`;
  return `
  <button type="button" class="molde-row-card" onclick="openDetailModal('molde','${m.id}')">
    <div class="molde-row-image">
      ${imageContent}
      <span class="molde-row-blur"></span>
    </div>
    <div class="molde-row-body">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-bold text-white truncate">${m.nome}</p>
        <span class="shrink-0 ${canMake ? "text-emerald-400" : "text-red-400"}">
          <i data-lucide="${canMake ? "check-circle-2" : "x-circle"}" class="w-3.5 h-3.5"></i>
        </span>
      </div>
      <p class="text-[9px] uppercase tracking-wide text-accentlight font-semibold">Molde CNC</p>
    </div>
    <div class="molde-row-chevron"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></div>
  </button>`;
}

function renderMoldesPage() {
  const items = getFilteredMoldes();
  const grid = document.getElementById("moldesGrid");
  const empty = document.getElementById("moldesEmptyState");

  if (!items.length) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    refreshIcons();
    return;
  }
  empty.classList.add("hidden");
  grid.innerHTML = items.map(moldeRowCard).join("");
  refreshIcons();
}

/* ============================================================= loja === */
// Peças que a oficina NÃO fabrica — apenas compra pronta de fornecedores.
// Sem receita, sem checagem de estoque: é só um catálogo com preço.

function getFilteredLoja() {
  const q = state.loja.search.trim().toLowerCase();
  const cat = state.loja.category;
  let items = [...LOJA_ITEMS];
  if (cat !== "Todos") items = items.filter((i) => i.categoria === cat);
  if (q) items = items.filter((i) => i.nome.toLowerCase().includes(q));
  return items;
}

function lojaItemCard(item) {
  const selected = !!state.order[item.id];
  return `
  <div class="molde-row-card loja-select-card !cursor-default ${selected ? "is-selected" : ""}">
    <label class="row-select" title="Selecionar para a Ordem de Serviço" onclick="event.stopPropagation()">
      <input type="checkbox" data-order-id="${item.id}" ${selected ? "checked" : ""}
        onchange="toggleOrderItem('${item.id}', this.checked, this)" />
    </label>
    <div class="molde-row-image">
      <i data-lucide="${LOJA_CATEGORY_ICONS[item.categoria] || "shopping-cart"}" class="w-4 h-4 opacity-90"></i>
      <span class="molde-row-blur"></span>
    </div>
    <div class="molde-row-body">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-bold text-white truncate">${item.nome}</p>
      </div>
      <p class="text-[9px] uppercase tracking-wide text-accentlight font-semibold">${fmtMoney(item.valor)}</p>
    </div>
  </div>`;
}

function renderLojaPage() {
  const items = getFilteredLoja();
  const groupsEl = document.getElementById("lojaGroups");
  const empty = document.getElementById("lojaEmptyState");

  if (!items.length) {
    groupsEl.innerHTML = "";
    empty.classList.remove("hidden");
    refreshIcons();
    return;
  }
  empty.classList.add("hidden");

  const categoriasComItens = LOJA_CATEGORIES.filter((cat) => items.some((i) => i.categoria === cat));
  groupsEl.innerHTML = categoriasComItens.map((cat) => {
    const catItems = items.filter((i) => i.categoria === cat);
    return `
      <div class="card-panel">
        <h3 class="flex items-center gap-2 text-white font-semibold mb-4">
          <i data-lucide="${LOJA_CATEGORY_ICONS[cat] || "shopping-cart"}" class="w-[18px] h-[18px] text-accentlight"></i>
          ${cat}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          ${catItems.map(lojaItemCard).join("")}
        </div>
      </div>`;
  }).join("");

  refreshIcons();
}

/* ================================================= ordem de serviço === */
// Seleção de itens da Loja para montar uma "Ordem de Serviço": lista de
// compra/venda com quantidades e valor total, pronta para copiar e colar
// no chat da RP.

function toggleOrderItem(id, checked, el) {
  if (checked) {
    if (!state.order[id]) {
      const item = LOJA_ITEMS.find((i) => i.id === id);
      if (!item) return;
      state.order[id] = { id: item.id, nome: item.nome, categoria: item.categoria, valor: item.valor, qtd: 1 };
    }
  } else {
    delete state.order[id];
  }
  const card = el ? el.closest(".loja-select-card") : null;
  if (card) card.classList.toggle("is-selected", checked);
  renderOrderBar();
}

function updateOrderQty(id, delta) {
  const entry = state.order[id];
  if (!entry) return;
  entry.qtd = Math.max(1, entry.qtd + delta);
  renderOrderBar();
  renderOrderModalBody();
}

function removeOrderItem(id) {
  delete state.order[id];
  const cb = document.querySelector(`input[data-order-id="${id}"]`);
  if (cb) {
    cb.checked = false;
    const card = cb.closest(".loja-select-card");
    if (card) card.classList.remove("is-selected");
  }
  renderOrderBar();
  renderOrderModalBody();
}

function clearOrder() {
  state.order = {};
  document.querySelectorAll('input[data-order-id]').forEach((cb) => {
    cb.checked = false;
    const card = cb.closest(".loja-select-card");
    if (card) card.classList.remove("is-selected");
  });
  renderOrderBar();
  renderOrderModalBody();
}

function getOrderTotals() {
  const entries = Object.values(state.order);
  const totalQtd = entries.reduce((s, e) => s + e.qtd, 0);
  const totalValor = entries.reduce((s, e) => s + e.qtd * e.valor, 0);
  return { entries, totalQtd, totalValor };
}

function renderOrderBar() {
  const bar = document.getElementById("orderBar");
  if (!bar) return;
  const { entries, totalQtd, totalValor } = getOrderTotals();
  if (!entries.length) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  document.getElementById("orderBarCount").textContent =
    `${totalQtd} ${totalQtd === 1 ? "item selecionado" : "itens selecionados"}`;
  document.getElementById("orderBarTotal").textContent = fmtMoney(totalValor);
}

function orderLineRow(entry) {
  return `
  <div class="material-row justify-between">
    <div class="min-w-0">
      <p class="text-sm font-semibold text-white truncate">${entry.nome}</p>
      <p class="text-[11px] text-gray-500">${fmtMoney(entry.valor)} un. · ${entry.categoria}</p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <div class="qty-stepper">
        <button type="button" title="Diminuir" onclick="updateOrderQty('${entry.id}', -1)">−</button>
        <span>${entry.qtd}</span>
        <button type="button" title="Aumentar" onclick="updateOrderQty('${entry.id}', 1)">+</button>
      </div>
      <span class="text-sm font-bold text-accentlight w-20 text-right shrink-0">${fmtMoney(entry.valor * entry.qtd)}</span>
      <button type="button" class="icon-btn danger" title="Remover" onclick="removeOrderItem('${entry.id}')">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  </div>`;
}

function padOS(n) {
  return `#${String(n).padStart(4, "0")}`;
}

function loadOrderHistory() {
  try {
    const raw = localStorage.getItem("ag_os_history");
    state.orderHistory = raw ? JSON.parse(raw) : [];
  } catch {
    state.orderHistory = [];
  }
  const counterRaw = localStorage.getItem("ag_os_counter");
  state.orderCounter = counterRaw ? parseInt(counterRaw, 10) || 0 : 0;
}

function saveOrderHistory() {
  localStorage.setItem("ag_os_history", JSON.stringify(state.orderHistory));
  localStorage.setItem("ag_os_counter", String(state.orderCounter));
}

function renderOrderModalBody() {
  const body = document.getElementById("orderModalBody");
  if (!body) return;
  const { entries, totalValor } = getOrderTotals();
  body.innerHTML = entries.length
    ? entries.map(orderLineRow).join("")
    : `<p class="text-sm text-gray-500 text-center py-6">Nenhum item selecionado. Marque peças na aba Peças LOJA.</p>`;
  document.getElementById("orderModalTotal").textContent = fmtMoney(totalValor);
  document.getElementById("orderModalNumero").textContent = padOS(state.orderCounter + 1);
  refreshIcons();
}

function openOrderModal() {
  if (!Object.keys(state.order).length) {
    showToast("Selecione ao menos um item da loja primeiro", "alert-triangle");
    return;
  }
  renderOrderModalBody();
  openModal("orderModal");
}

function buildOrderText(registro = null) {
  const numero = registro ? registro.numero : state.orderCounter + 1;
  const dataObj = registro ? new Date(registro.data) : new Date();
  const itens = registro ? registro.itens : getOrderTotals().entries;
  const total = registro ? registro.total : getOrderTotals().totalValor;
  const dataStr = dataObj.toLocaleDateString("pt-BR");
  const linhas = itens.map((e) => {
    const rotulo = `${e.qtd}x ${e.nome}`;
    const valorLinha = fmtMoney(e.valor * e.qtd);
    const pontos = ".".repeat(Math.max(2, 42 - rotulo.length));
    return `${rotulo} ${pontos} ${valorLinha}`;
  });
  return [
    `=== ORDEM DE SERVIÇO ${padOS(numero)} — ANDRADE GARAGE ===`,
    `Data: ${dataStr}`,
    "",
    ...(linhas.length ? linhas : ["(nenhum item selecionado)"]),
    "",
    "------------------------------------------",
    `TOTAL: ${fmtMoney(total)}`,
  ].join("\n");
}

function copyTextToClipboard(text, onSuccessMsg) {
  const fallbackCopy = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(onSuccessMsg);
    } catch {
      showToast("Não foi possível copiar", "x-circle");
    }
    document.body.removeChild(ta);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(onSuccessMsg), fallbackCopy);
  } else {
    fallbackCopy();
  }
}

function copyOrderText(numero = null) {
  if (numero) {
    const registro = state.orderHistory.find((r) => r.numero === numero);
    if (!registro) return;
    copyTextToClipboard(buildOrderText(registro), `Ordem de Serviço ${padOS(numero)} copiada`);
    return;
  }
  if (!Object.keys(state.order).length) return;
  copyTextToClipboard(buildOrderText(), "Ordem de Serviço copiada");
}

// Confirma o carrinho atual: emite um número de OS, salva no histórico
// (persistido no navegador) e esvazia a seleção da Loja.
function confirmOrder() {
  const { entries, totalValor } = getOrderTotals();
  if (!entries.length) {
    showToast("Selecione itens antes de confirmar a OS", "alert-triangle");
    return;
  }
  state.orderCounter += 1;
  const registro = {
    numero: state.orderCounter,
    data: new Date().toISOString(),
    itens: entries.map((e) => ({ nome: e.nome, categoria: e.categoria, valor: e.valor, qtd: e.qtd })),
    total: totalValor,
  };
  state.orderHistory.unshift(registro);
  saveOrderHistory();
  clearOrder();
  closeModal("orderModal");
  showToast(`Ordem de Serviço ${padOS(registro.numero)} confirmada e salva`, "clipboard-check");
}

function deleteOrderHistoryEntry(numero) {
  state.orderHistory = state.orderHistory.filter((r) => r.numero !== numero);
  saveOrderHistory();
  renderOrderHistoryModal();
}

function orderHistoryRow(reg) {
  const dataStr = new Date(reg.data).toLocaleDateString("pt-BR");
  const totalItens = reg.itens.reduce((s, i) => s + i.qtd, 0);
  return `
  <div class="card-panel !p-3.5">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm font-bold text-white">OS ${padOS(reg.numero)}</p>
        <p class="text-xs text-gray-500 mt-0.5">${dataStr} · ${totalItens} ${totalItens === 1 ? "item" : "itens"}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-sm font-bold text-accentlight">${fmtMoney(reg.total)}</span>
        <button type="button" class="icon-btn" title="Copiar" onclick="copyOrderText(${reg.numero})">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
        </button>
        <button type="button" class="icon-btn danger" title="Excluir" onclick="deleteOrderHistoryEntry(${reg.numero})">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  </div>`;
}

function renderOrderHistoryModal() {
  const body = document.getElementById("orderHistoryBody");
  if (!body) return;
  body.innerHTML = state.orderHistory.length
    ? state.orderHistory.map(orderHistoryRow).join("")
    : `<p class="text-sm text-gray-500 text-center py-6">Nenhuma Ordem de Serviço confirmada ainda.</p>`;
  refreshIcons();
}

function openOrderHistoryModal() {
  renderOrderHistoryModal();
  openModal("orderHistoryModal");
}


/* ===================================================== modal de detalhes === */
// Modal reutilizado tanto para "Peças" quanto para "Moldes CNC". Suporta
// navegação em pilha: ao clicar num material marcado como "peça forjada",
// abre-se uma nova "aba" (camada) mostrando a receita daquele item.

function getDetailData(entry) {
  if (entry.type === "molde") return MOLDES_CNC.find((m) => m.id === entry.id);
  return PARTS.find((p) => p.id === entry.id);
}

function openDetailModal(type, id) {
  state.detailStack = [{ type, id }];
  state.forgeQty = 1;
  openModal("detailModal");
  renderDetailModal();
}

function pushDetail(type, id) {
  state.detailStack.push({ type, id });
  state.forgeQty = 1;
  renderDetailModal();
  document.getElementById("detailModalBody").scrollTop = 0;
}

function truncateDetailStack(index) {
  state.detailStack = state.detailStack.slice(0, index + 1);
  state.forgeQty = 1;
  renderDetailModal();
}

function backDetail() {
  if (state.detailStack.length > 1) {
    state.detailStack.pop();
    state.forgeQty = 1;
    renderDetailModal();
  }
}

// Quantas unidades dá pra forjar agora, olhando só os materiais diretos
// (não-forjados) controlados no Baú. Peças forjadas usadas como material
// não entram na conta — não são controladas como estoque neste app.
function getMaxForjavel(materiais) {
  let max = Infinity;
  let temMaterialControlado = false;
  materiais.forEach((m) => {
    if (m.forjada) return;
    const bau = findBauItemByName(m.nome);
    if (bau) {
      temMaterialControlado = true;
      max = Math.min(max, Math.floor(bau.quantidade / m.quantidade));
    }
  });
  if (!temMaterialControlado) return 99; // nada pra checar no Baú — não há o que travar
  return Math.max(0, max);
}

function changeForgeQty(delta) {
  const entry = state.detailStack[state.detailStack.length - 1];
  const data = getDetailData(entry);
  const max = Math.max(1, getMaxForjavel(data.materiais));
  state.forgeQty = Math.min(Math.max(1, state.forgeQty + delta), max);
  renderDetailModal();
}

function forjarItem() {
  const entry = state.detailStack[state.detailStack.length - 1];
  const data = getDetailData(entry);
  const max = getMaxForjavel(data.materiais);
  const qtd = Math.min(state.forgeQty, max);
  if (qtd < 1) {
    showToast("Materiais insuficientes no Baú para forjar", "x-circle");
    return;
  }
  data.materiais.forEach((m) => {
    if (m.forjada) return;
    const bau = findBauItemByName(m.nome);
    if (bau) {
      bau.quantidade = Math.max(0, bau.quantidade - m.quantidade * qtd);
      bau.ultimaAtualizacao = todayStr();
    }
  });
  state.forgeQty = 1;
  showToast(`${data.nome} forjada${qtd > 1 ? ` (${qtd}x)` : ""} — materiais debitados do Baú`, "hammer");
  renderDetailModal();
  saveBauToServer();
  if (state.currentPage === "dashboard") renderDashboard();
  if (state.currentPage === "bau") renderBauPage();
  if (state.currentPage === "forjados") renderForjadosPage();
  if (state.currentPage === "moldescnc") renderMoldesPage();
}

function detailMaterialRow(m) {
  if (m.forjada) {
    return `
      <button type="button" class="material-row forjada-row w-full text-left" onclick="pushDetail('${m.ref.type}','${m.ref.id}')">
        <div class="flex-1 min-w-0">
          <span class="forjada-badge"><i data-lucide="hammer" class="w-3 h-3"></i>Peça Forjada</span>
          <p class="text-sm font-medium text-white mt-1.5 truncate">${m.nome}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-sm text-accentlight font-semibold">x${m.quantidade}</span>
          <i data-lucide="chevron-right" class="w-4 h-4 text-gray-500"></i>
        </div>
      </button>`;
  }
  const bau = findBauItemByName(m.nome);
  const has = bau ? bau.quantidade >= m.quantidade : null;
  return `
    <div class="material-row">
      <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-200 truncate">${m.nome}</p>
        ${bau ? `<p class="text-xs ${has ? "text-emerald-400" : "text-red-400"} mt-0.5">${bau.quantidade} em estoque</p>` : `<p class="text-xs text-gray-600 mt-0.5">Não controlado no Baú</p>`}
      </div>
      <span class="text-sm font-semibold ${bau ? (has ? "text-emerald-400" : "text-red-400") : "text-gray-400"} shrink-0">x${m.quantidade}</span>
    </div>`;
}

function renderDetailModal() {
  const entry = state.detailStack[state.detailStack.length - 1];
  const data = getDetailData(entry);
  if (!data) return;

  const isMolde = entry.type === "molde";
  document.getElementById("detailModalIconWrap").innerHTML = data.imagem
    ? `<img src="${data.imagem}" alt="${data.nome}" class="detail-icon-photo" onerror="this.parentElement.innerHTML='<i data-lucide=\\'${isMolde ? "drafting-compass" : (CATEGORY_ICONS[data.categoria] || "wrench")}\\' class=\\'w-5 h-5\\'></i>'; lucide.createIcons();" />`
    : `<i data-lucide="${isMolde ? "drafting-compass" : (CATEGORY_ICONS[data.categoria] || "wrench")}" class="w-5 h-5"></i>`;
  document.getElementById("detailModalTitle").textContent = data.nome;
  document.getElementById("detailModalSubtitle").textContent =
    isMolde ? "Molde CNC · peça bruta" : (data.subtitulo ? `${data.subtitulo} · ${data.categoria}` : data.categoria);

  // Breadcrumbs (só aparecem quando há mais de 1 nível de navegação)
  const crumbsWrap = document.getElementById("detailBreadcrumbs");
  if (state.detailStack.length > 1) {
    crumbsWrap.classList.remove("hidden");
    crumbsWrap.innerHTML = state.detailStack.map((s, idx) => {
      const d = getDetailData(s);
      const isLast = idx === state.detailStack.length - 1;
      return `<button type="button" class="breadcrumb-item ${isLast ? "text-white font-semibold" : "text-gray-500 hover:text-gray-300"}" onclick="truncateDetailStack(${idx})">${d ? d.nome : "?"}</button>` +
        (isLast ? "" : `<i data-lucide="chevron-right" class="w-3 h-3 text-gray-600"></i>`);
    }).join("");
  } else {
    crumbsWrap.classList.add("hidden");
    crumbsWrap.innerHTML = "";
  }

  document.getElementById("detailBackBtn").classList.toggle("hidden", state.detailStack.length <= 1);

  const { canMake, missing } = checkDirectStock(data.materiais);
  const maxForjavel = getMaxForjavel(data.materiais);
  if (state.forgeQty > Math.max(1, maxForjavel)) state.forgeQty = Math.max(1, maxForjavel);
  if (state.forgeQty < 1) state.forgeQty = 1;

  document.getElementById("detailModalBody").innerHTML = `
    ${data.imagem ? `<div class="detail-photo-banner"><img src="${data.imagem}" alt="${data.nome}" loading="lazy" onerror="this.parentElement.style.display='none'" /></div>` : ""}
    <div class="status-pill ${canMake ? "status-ok" : "status-fail"} text-sm mb-4">
      <i data-lucide="${canMake ? "check-circle-2" : "x-circle"}" class="w-4 h-4"></i>
      ${canMake ? "Materiais diretos disponíveis no Baú" : `Faltam ${missing.length} material(is) direto(s)`}
    </div>
    <div class="space-y-2">
      ${data.materiais.map(detailMaterialRow).join("")}
    </div>
    <p class="text-[11px] text-gray-600 mt-4">Itens marcados como <span class="text-accentlight font-semibold">Peça Forjada</span> não são controlados diretamente no Baú — clique para ver a receita necessária para forjá-los.</p>

    <div class="forge-box">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-white">Forjar agora</p>
          <p class="text-xs text-gray-500">Debita os materiais diretos do Baú automaticamente.</p>
        </div>
        <div class="qty-stepper shrink-0">
          <button type="button" title="Diminuir" onclick="changeForgeQty(-1)">−</button>
          <span>${state.forgeQty}</span>
          <button type="button" title="Aumentar" onclick="changeForgeQty(1)">+</button>
        </div>
      </div>
      <button type="button" class="btn-primary w-full justify-center mt-3" ${maxForjavel < 1 ? "disabled" : ""} onclick="forjarItem()">
        <i data-lucide="hammer" class="w-4 h-4"></i>
        Forjar${state.forgeQty > 1 ? ` ${state.forgeQty}x` : ""}
      </button>
      ${maxForjavel < 1
        ? `<p class="text-[11px] text-red-400 mt-2">Estoque insuficiente no Baú para forjar.</p>`
        : `<p class="text-[11px] text-gray-600 mt-2">Máximo possível agora: ${maxForjavel}x</p>`}
    </div>
  `;

  refreshIcons();
}

/* =========================================================== configs === */

function renderConfiguracoes() {
  document.getElementById("cfgTotalItens").textContent = bauItems.length;
  document.getElementById("cfgTotalReceitas").textContent = PARTS.length;
}

/* ============================================================== perfil === */

// Pega as iniciais de um nome pra usar como avatar padrão (ex: "João Pedro" → "JP").
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

// Aplica o perfil (nome/foto/cargo) no rodapé da sidebar. Chamado assim que
// auth-guard.js termina de buscar /api/me, e de novo depois de salvar
// mudanças em Perfil — sem precisar recarregar a página.
function applyProfileToSidebar(profile) {
  if (!profile) return;
  state.profile = profile;

  const name = profile.displayName || profile.username;
  const nameEl = document.getElementById("sidebarUserName");
  const roleEl = document.getElementById("sidebarUserRole");
  const initialsEl = document.getElementById("sidebarUserInitials");
  const imgEl = document.getElementById("sidebarUserAvatarImg");

  if (nameEl) nameEl.textContent = name;
  if (roleEl) roleEl.textContent = profile.role || "ANDRADE GARAGE";

  if (profile.avatarData) {
    if (imgEl) { imgEl.src = profile.avatarData; imgEl.classList.remove("hidden"); }
    if (initialsEl) initialsEl.classList.add("hidden");
  } else {
    if (imgEl) imgEl.classList.add("hidden");
    if (initialsEl) { initialsEl.textContent = getInitials(name); initialsEl.classList.remove("hidden"); }
  }
}

// Liga o menu (⋮) do rodapé da sidebar: abrir/fechar, "Meu perfil" e "Deslogar".
function initSidebarUser() {
  // Se o perfil já chegou antes desse ponto (auth-guard.js roda antes de
  // script.js terminar de carregar), aplica na hora. Senão, escuta o evento.
  if (window.AG_PROFILE) applyProfileToSidebar(window.AG_PROFILE);
  window.addEventListener("ag:profile-loaded", (e) => applyProfileToSidebar(e.detail));

  const row = document.getElementById("sidebarUserRow");
  const menuBtn = document.getElementById("sidebarUserMenuBtn");
  const menu = document.getElementById("sidebarUserMenu");
  const profileBtn = document.getElementById("sidebarProfileBtn");
  const logoutBtn = document.getElementById("sidebarLogoutBtn");
  if (!row || !menuBtn || !menu) return;

  row.addEventListener("click", () => navigateTo("perfil"));

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.add("hidden");
    navigateTo("perfil");
  });

  logoutBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (window.AG_logout) window.AG_logout();
  });

  document.addEventListener("click", () => menu.classList.add("hidden"));
}

// Estado local (não salvo ainda) da troca de avatar na página Perfil.
let pendingAvatarData = null;
let avatarWasRemoved = false;

function renderPerfilPage() {
  const p = state.profile || window.AG_PROFILE;
  if (!p) return;

  pendingAvatarData = null;
  avatarWasRemoved = false;

  document.getElementById("profileUsernameLabel").textContent = "@" + p.username;
  document.getElementById("profileDisplayName").value = p.displayName === p.username ? "" : (p.displayName || "");
  document.getElementById("profileError").classList.add("hidden");
  document.getElementById("profileSuccess").classList.add("hidden");

  const imgEl = document.getElementById("profileAvatarImg");
  const initEl = document.getElementById("profileAvatarInitials");
  const removeBtn = document.getElementById("profileRemoveAvatarBtn");

  if (p.avatarData) {
    imgEl.src = p.avatarData;
    imgEl.classList.remove("hidden");
    initEl.classList.add("hidden");
    removeBtn.classList.remove("hidden");
  } else {
    imgEl.classList.add("hidden");
    initEl.textContent = getInitials(p.displayName || p.username);
    initEl.classList.remove("hidden");
    removeBtn.classList.add("hidden");
  }
}

// Redimensiona/recorta a foto escolhida em um quadrado 256x256 (JPEG),
// pra não guardar imagens gigantes no banco.
function readAndResizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const SIZE = 256;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function initProfilePage() {
  const fileInput = document.getElementById("avatarFileInput");
  const removeBtn = document.getElementById("profileRemoveAvatarBtn");
  const saveBtn = document.getElementById("profileSaveBtn");
  if (!fileInput || !saveBtn) return;

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Escolha um arquivo de imagem válido.", "alert-circle");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("Imagem muito grande. Escolha um arquivo de até 8MB.", "alert-circle");
      return;
    }

    try {
      const dataUrl = await readAndResizeAvatar(file);
      pendingAvatarData = dataUrl;
      avatarWasRemoved = false;

      const imgEl = document.getElementById("profileAvatarImg");
      imgEl.src = dataUrl;
      imgEl.classList.remove("hidden");
      document.getElementById("profileAvatarInitials").classList.add("hidden");
      document.getElementById("profileRemoveAvatarBtn").classList.remove("hidden");
    } catch (err) {
      showToast(err.message || "Erro ao processar a imagem.", "alert-circle");
    }
  });

  removeBtn?.addEventListener("click", () => {
    pendingAvatarData = null;
    avatarWasRemoved = true;
    document.getElementById("profileAvatarImg").classList.add("hidden");
    document.getElementById("profileAvatarInitials").classList.remove("hidden");
    removeBtn.classList.add("hidden");
  });

  saveBtn.addEventListener("click", async () => {
    const errorEl = document.getElementById("profileError");
    const successEl = document.getElementById("profileSuccess");
    errorEl.classList.add("hidden");
    successEl.classList.add("hidden");

    const displayName = document.getElementById("profileDisplayName").value.trim();
    const payload = { displayName };
    if (avatarWasRemoved) payload.avatarData = null;
    else if (pendingAvatarData) payload.avatarData = pendingAvatarData;

    const originalLabel = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = "Salvando...";

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        errorEl.textContent = data.error || "Erro ao salvar as alterações.";
        errorEl.classList.remove("hidden");
        return;
      }

      applyProfileToSidebar(data.profile);
      window.AG_PROFILE = data.profile;
      renderPerfilPage();
      successEl.textContent = "Alterações salvas.";
      successEl.classList.remove("hidden");
      showToast("Perfil atualizado.");
    } catch (err) {
      errorEl.textContent = "Erro ao salvar. Verifique sua conexão e tente de novo.";
      errorEl.classList.remove("hidden");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalLabel;
    }
  });
}

/* ============================================================== modais === */

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
  document.body.style.overflow = "hidden";
  refreshIcons();
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
  document.body.style.overflow = "";
  if (id === "detailModal") state.detailStack = [];
}

/* ================================================================ init === */

// Mapa id → caminho da imagem, vindo de assets/image-map.json (mantido pelo
// painel /admin.html). É compartilhado por todo mundo — só as QUANTIDADES e
// os itens do Baú em si é que são por usuário (ver loadBauFromServer).
let imageOverridesMap = {};

// Carrega assets/image-map.json e aplica o campo "imagem" em PARTS e
// MOLDES_CNC (catálogos fixos, iguais pra todo mundo). O Baú aplica essas
// imagens separadamente, em applyImageOverrides(), porque o array dele
// muda de usuário pra usuário.
async function loadImageOverrides() {
  try {
    const res = await fetch("assets/image-map.json", { cache: "no-store" });
    if (!res.ok) return;
    imageOverridesMap = await res.json();
    [PARTS, MOLDES_CNC].forEach((list) => {
      list.forEach((item) => {
        if (imageOverridesMap[item.id]) item.imagem = imageOverridesMap[item.id];
      });
    });
  } catch (err) {
    console.warn("assets/image-map.json não carregado:", err.message);
  }
}

function applyImageOverrides(list) {
  list.forEach((item) => {
    if (imageOverridesMap[item.id]) item.imagem = imageOverridesMap[item.id];
  });
}

// Carrega o Baú DESSE usuário a partir do banco (Neon). Se ele nunca salvou
// nada ainda (primeiro acesso), começa a partir do catálogo padrão de
// data.js e já salva isso como o Baú inicial dele.
async function loadBauFromServer() {
  try {
    const res = await fetch("/api/bau", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length) {
        bauItems = data.items;
        applyImageOverrides(bauItems);
        return;
      }
    }
  } catch (err) {
    console.warn("Não foi possível carregar o Baú do servidor:", err.message);
  }

  bauItems = JSON.parse(JSON.stringify(BAU_ITEMS));
  applyImageOverrides(bauItems);
  saveBauToServer();
}

// Salva o Baú desse usuário no banco. Chamado depois de qualquer mudança
// (adicionar/editar/remover item, forjar, ou restaurar os dados originais).
async function saveBauToServer() {
  try {
    const res = await fetch("/api/bau", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: bauItems }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `O servidor respondeu ${res.status}`);
    }
  } catch (err) {
    console.warn("Não foi possível salvar o Baú no servidor:", err);
    showToast(`Não foi possível salvar o Baú: ${err.message}`, "alert-circle");
  }
}

async function init() {
  await loadImageOverrides();
  await loadBauFromServer();
  refreshIcons();
  loadOrderHistory();
  navigateTo("dashboard");

  // Navegação sidebar
  document.querySelectorAll(".nav-item[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.page));
  });

  // Rodapé sidebar: usuário logado (nome/foto/cargo) + menu (Perfil / Deslogar)
  initSidebarUser();
  initProfilePage();

  // Sidebar recolhível (desktop) — lembra a preferência do usuário
  const sidebarEl = document.getElementById("sidebar");
  if (localStorage.getItem("ag_sidebar_collapsed") === "1") {
    sidebarEl.classList.add("collapsed");
  }
  document.getElementById("collapseBtn").addEventListener("click", () => {
    const collapsed = sidebarEl.classList.toggle("collapsed");
    localStorage.setItem("ag_sidebar_collapsed", collapsed ? "1" : "0");
  });

  // Sidebar mobile
  document.getElementById("openMobileSidebar").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebarOverlay").classList.remove("hidden");
  });
  document.getElementById("closeMobileSidebar").addEventListener("click", closeMobileSidebar);
  document.getElementById("sidebarOverlay").addEventListener("click", closeMobileSidebar);

  // Baú: busca / filtros / ordenação
  document.getElementById("bauSearch").addEventListener("input", (e) => {
    state.bau.search = e.target.value;
    renderBauPage();
  });
  document.getElementById("bauCategoryFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    document.querySelectorAll("#bauCategoryFilters .filter-pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.bau.category = btn.dataset.cat;
    renderBauPage();
  });
  document.getElementById("bauSort").addEventListener("change", (e) => {
    state.bau.sort = e.target.value;
    renderBauPage();
  });
  document.getElementById("addItemBtn").addEventListener("click", () => openItemModal());
  document.getElementById("itemForm").addEventListener("submit", saveItemForm);
  document.getElementById("importBauBtn").addEventListener("click", openImportBauModal);
  document.getElementById("forgeOsBtn").addEventListener("click", openForgeOsModal);
  updateForgeOsIndicator();

  // Ordem de Serviço (seleção de itens da Loja)
  document.getElementById("orderBarClearBtn").addEventListener("click", clearOrder);
  document.getElementById("orderBarGenBtn").addEventListener("click", openOrderModal);
  document.getElementById("orderCopyBtn").addEventListener("click", () => copyOrderText());
  document.getElementById("orderClearAllBtn").addEventListener("click", clearOrder);
  document.getElementById("orderConfirmBtn").addEventListener("click", confirmOrder);
  document.getElementById("openOrderHistoryBtn").addEventListener("click", openOrderHistoryModal);

  // Peças: busca
  document.getElementById("forjadosSearch").addEventListener("input", (e) => {
    state.forjados.search = e.target.value;
    renderForjadosPage();
  });

  // Moldes CNC: busca
  document.getElementById("moldesSearch").addEventListener("input", (e) => {
    state.moldes.search = e.target.value;
    renderMoldesPage();
  });

  // Peças LOJA: busca + filtro de categoria (pills geradas dinamicamente)
  const lojaFilters = document.getElementById("lojaCategoryFilters");
  lojaFilters.innerHTML += LOJA_CATEGORIES.map((cat) => `<button data-cat="${cat}" class="filter-pill">${cat}</button>`).join("");
  document.getElementById("lojaSearch").addEventListener("input", (e) => {
    state.loja.search = e.target.value;
    renderLojaPage();
  });
  lojaFilters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    lojaFilters.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.loja.category = btn.dataset.cat;
    renderLojaPage();
  });

  // Modal de detalhes
  document.getElementById("detailBackBtn").addEventListener("click", backDetail);

  // Modais: fechar
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && overlay.dataset.locked !== "true") closeModal(overlay.id);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay:not(.hidden)").forEach((m) => {
        if (m.dataset.locked !== "true") closeModal(m.id);
      });
    }
  });

  // Configurações — animações de interface (com preferência salva)
  const animToggle = document.getElementById("animToggle");
  const animsOff = localStorage.getItem("ag_anims_off") === "1";
  if (animsOff) {
    animToggle.classList.remove("on");
    document.documentElement.classList.add("no-anim");
  }
  animToggle.addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("on");
    const isOff = !e.currentTarget.classList.contains("on");
    document.documentElement.classList.toggle("no-anim", isOff);
    localStorage.setItem("ag_anims_off", isOff ? "1" : "0");
  });

  // Botões "limpar busca" (x) dentro dos campos de pesquisa
  document.querySelectorAll(".search-clear-btn").forEach((btn) => {
    const input = document.getElementById(btn.dataset.clear);
    if (!input) return;
    const wrap = input.closest(".search-wrap");
    const syncState = () => wrap.classList.toggle("has-value", input.value.length > 0);
    input.addEventListener("input", syncState);
    btn.addEventListener("click", () => {
      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.focus();
    });
    syncState();
  });

  // Atalho de teclado "/" para focar a busca da página atual
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    const searchByPage = { bau: "bauSearch", forjados: "forjadosSearch", moldescnc: "moldesSearch", loja: "lojaSearch" };
    const inputId = searchByPage[state.currentPage];
    if (!inputId) return;
    e.preventDefault();
    document.getElementById(inputId).focus();
  });

  // Botão "voltar ao topo"
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("show", window.scrollY > 420);
  });
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: animToggle.classList.contains("on") ? "smooth" : "auto" });
  });
  document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (!confirm("Restaurar todos os dados para os valores originais?")) return;
    bauItems = JSON.parse(JSON.stringify(BAU_ITEMS));
    applyImageOverrides(bauItems);
    saveBauToServer();
    showToast("Dados restaurados com sucesso", "rotate-ccw");
    navigateTo(state.currentPage);
  });
}

document.addEventListener("DOMContentLoaded", init);
