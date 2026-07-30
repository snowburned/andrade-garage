/* ==========================================================================
   ANDRADE GARAGE — script.js
   Toda a lógica da aplicação: navegação, renderização, busca, filtros,
   CRUD do Baú, catálogo de Peças (com drill-down de peças forjadas) e
   catálogo de Moldes CNC.
   ========================================================================== */

// Cópia mutável do estoque (para permitir "restaurar dados")
let bauItems = JSON.parse(JSON.stringify(BAU_ITEMS));

// Estado da UI
const state = {
  currentPage: "dashboard",
  bau: { search: "", category: "Todos", sort: "none" },
  forjados: { search: "", view: "categories", activeCategory: null },
  moldes: { search: "" },
  editingItemId: null,
  detailStack: [], // pilha de navegação do modal de detalhes { type: 'parte'|'molde', id }
};

const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral da oficina" },
  bau: { title: "Baú", subtitle: "Controle completo do estoque de materiais" },
  forjados: { title: "Peças", subtitle: "Catálogo completo de peças da oficina, organizado por sistema" },
  moldescnc: { title: "Moldes CNC", subtitle: "Peças brutas usinadas, usadas como base para forjar componentes" },
  configuracoes: { title: "Configurações", subtitle: "Preferências do sistema" },
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
    default: return "badge-minerios";
  }
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
  if (page === "configuracoes") renderConfiguracoes();
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

function computePodeForjarCount() {
  return PARTS.filter((p) => checkDirectStock(p.materiais).canMake).length;
}

function renderDashboard() {
  document.getElementById("statPecas").textContent = PARTS.length;
  document.getElementById("statItensBau").textContent = bauItems.reduce((sum, i) => sum + i.quantidade, 0);
  document.getElementById("statPodeForjar").textContent = `${computePodeForjarCount()} / ${PARTS.length}`;

  const latest = bauItems.reduce((acc, i) => (i.ultimaAtualizacao > acc ? i.ultimaAtualizacao : acc), "0000-00-00");
  document.getElementById("statUltimaAtualizacao").textContent = fmtDate(latest);
  document.getElementById("statTotalMateriais").textContent = bauItems.length;

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

  // Estoque crítico (quantidade <= 10)
  const low = [...bauItems].filter((i) => i.quantidade <= 10).sort((a, b) => a.quantidade - b.quantidade);
  document.getElementById("dashLowStock").innerHTML = low.length
    ? low.map((i) => `
        <div class="flex items-center justify-between text-sm py-1.5 border-b border-[#26282c] last:border-0">
          <span class="text-gray-300">${i.nome}</span>
          <span class="text-amber-400 font-semibold">${i.quantidade} un</span>
        </div>`).join("")
    : `<p class="text-sm text-gray-500">Nenhum material em nível crítico.</p>`;

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
      const bg = `radial-gradient(circle at 30% 20%, ${hexToRgba(visual.color, 0.3)}, transparent 65%), linear-gradient(160deg, #26282c 0%, #1a1b1e 100%)`;
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
  const categoria = document.getElementById("itemCategoria").value;
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
  const imageContent = p.imagem
    ? `<img src="${p.imagem}" alt="${p.nome}" class="part-row-photo" loading="lazy" onerror="this.style.display='none'" />`
    : `<i data-lucide="${CATEGORY_ICONS[p.categoria] || "wrench"}" class="w-6 h-6 opacity-90"></i>`;
  return `
  <button type="button" class="part-row-card" onclick="openDetailModal('parte','${p.id}')">
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
  </button>`;
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
  return `
  <button type="button" class="molde-row-card" onclick="openDetailModal('molde','${m.id}')">
    <div class="molde-row-image">
      <i data-lucide="drafting-compass" class="w-4 h-4 opacity-90"></i>
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
  openModal("detailModal");
  renderDetailModal();
}

function pushDetail(type, id) {
  state.detailStack.push({ type, id });
  renderDetailModal();
  document.getElementById("detailModalBody").scrollTop = 0;
}

function truncateDetailStack(index) {
  state.detailStack = state.detailStack.slice(0, index + 1);
  renderDetailModal();
}

function backDetail() {
  if (state.detailStack.length > 1) {
    state.detailStack.pop();
    renderDetailModal();
  }
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
  `;

  refreshIcons();
}

/* =========================================================== configs === */

function renderConfiguracoes() {
  document.getElementById("cfgTotalItens").textContent = bauItems.length;
  document.getElementById("cfgTotalReceitas").textContent = PARTS.length;
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

function init() {
  refreshIcons();
  navigateTo("dashboard");

  // Navegação sidebar
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.page));
  });

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

  // Modal de detalhes
  document.getElementById("detailBackBtn").addEventListener("click", backDetail);

  // Modais: fechar
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay:not(.hidden)").forEach((m) => closeModal(m.id));
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
    const searchByPage = { bau: "bauSearch", forjados: "forjadosSearch", moldescnc: "moldesSearch" };
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
    showToast("Dados restaurados com sucesso", "rotate-ccw");
    navigateTo(state.currentPage);
  });
}

document.addEventListener("DOMContentLoaded", init);
