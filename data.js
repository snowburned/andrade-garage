/* ==========================================================================
   ANDRADE GARAGE — data.js
   Todos os dados do sistema. Sem banco de dados: apenas arrays JS.
   Edite este arquivo para adicionar/remover itens do Baú, Peças ou Moldes CNC.
   ========================================================================== */

// ---------------------------------------------------------------------------
// BAÚ — Estoque de materiais, organizado por categoria
// ---------------------------------------------------------------------------
const BAU_ITEMS = [
  // Minérios
  { id: "cobre",          nome: "Cobre",           categoria: "Minérios",        quantidade: 45,  estoqueMinimo: 20, ultimaAtualizacao: "2026-07-27" },
  { id: "ferro",           nome: "Ferro",           categoria: "Minérios",        quantidade: 120, estoqueMinimo: 40, ultimaAtualizacao: "2026-07-28" },
  { id: "aco",             nome: "Aço",             categoria: "Minérios",        quantidade: 80,  estoqueMinimo: 30, ultimaAtualizacao: "2026-07-28" },
  { id: "prata",           nome: "Prata",           categoria: "Minérios",        quantidade: 12,  estoqueMinimo: 15, ultimaAtualizacao: "2026-07-25" },
  { id: "titanio",         nome: "Titânio",         categoria: "Minérios",        quantidade: 8,   estoqueMinimo: 15, ultimaAtualizacao: "2026-07-24" },

  // Barras
  { id: "barra-cobre",     nome: "Barra de Cobre",  categoria: "Barras",          quantidade: 30,  estoqueMinimo: 15, ultimaAtualizacao: "2026-07-27", imagem: "assets/bau/barra-de-cobre.png" },
  { id: "barra-ferro",     nome: "Barra de Ferro",  categoria: "Barras",          quantidade: 60,  estoqueMinimo: 20, ultimaAtualizacao: "2026-07-28" },
  { id: "barra-aco",       nome: "Barra de Aço",    categoria: "Barras",          quantidade: 40,  estoqueMinimo: 15, ultimaAtualizacao: "2026-07-29" },
  { id: "barra-prata",     nome: "Barra de Prata",  categoria: "Barras",          quantidade: 5,   estoqueMinimo: 8,  ultimaAtualizacao: "2026-07-22", imagem: "assets/bau/barra-de-prata.png" },
  { id: "barra-titanio",   nome: "Barra de Titânio",categoria: "Barras",          quantidade: 3,   estoqueMinimo: 5,  ultimaAtualizacao: "2026-07-20" },

  // Barras Refinadas
  { id: "fio-cobre",       nome: "Fio de Cobre",    categoria: "Barras Refinadas", quantidade: 25, estoqueMinimo: 10, ultimaAtualizacao: "2026-07-26" },
  { id: "po-aluminio",     nome: "Pó de Alumínio",  categoria: "Barras Refinadas", quantidade: 15, estoqueMinimo: 10, ultimaAtualizacao: "2026-07-23" },
  { id: "po-aco",          nome: "Pó de Aço",       categoria: "Barras Refinadas", quantidade: 20, estoqueMinimo: 10, ultimaAtualizacao: "2026-07-27" },
];

// ---------------------------------------------------------------------------
// PRECOS — valor de mercado (em $) de cada item do Baú, Moldes CNC e Peças.
// Usado pelo Dashboard Inteligente para calcular o valor total do estoque
// e exibir preços no catálogo. Valores já reajustados em +10% sobre a
// tabela de referência da oficina.
// ---------------------------------------------------------------------------
const PRECOS = {
  // Minérios (valor estimado do minério bruto, antes de virar barra)
  "Cobre": 80, "Ferro": 175, "Aço": 880, "Prata": 530, "Titânio": 1540,

  // Barras (Lingotes)
  "Barra de Cobre": 200, "Barra de Ferro": 440, "Barra de Aço": 2200,
  "Barra de Prata": 1320, "Barra de Titânio": 3850,

  // Barras Refinadas
  "Pó de Aço": 2640, "Pó de Alumínio": 1595, "Fio de Cobre": 275, "Composto de Borracha": 165,

  // Impressão 3D (Moldes 3D)
  "Duto de Admissão": 660, "Caixa de Filtro Esportiva": 550, "Duto de Intercooler": 495,
  "Moldura de Filtro": 440, "Carcaça ECU Ecumaster": 440, "Suporte de ECU": 385,
  "Caixa de Fusíveis": 385, "Carcaça ECU Octtane": 385, "Base de ECU": 330, "Carcaça de Sensor": 220,

  // Impressão Industrial de Pó (Moldes CNC)
  "Bloco de Ferro Bruto": 37510, "Bloco de Alumínio Bruto": 34320, "Virabrequim Bruto": 29590,
  "Carcaça de Turbo Race": 27500, "Carcaça de Câmbio Bruto": 26400, "Carcaça de Diferencial Bruta": 25905,
  "Coletor de Escape Bruto": 21670, "Comando Bruto": 20075, "Cabeçote Bruto": 19580,
  "Carcaça de Turbo Média": 19030, "Volante de Motor Bruto": 19030, "Carcaça de Turbo Pequena": 13200,
  "Núcleo Bruto de Intercooler": 10010, "Núcleo Bruto de Radiador": 10010, "Molde de Biela Usinada": 9515,
  "Rotor Compressor": 9020, "Corpo de Borboleta Bruto": 9020, "Flauta de Combustível Bruta": 6600,
  "Caixa Lateral de Intercooler": 6380, "Molde de Pistão Usinado": 5830,

  // ECU / Eletrônica
  "ECU Ecumaster": 15400, "ECU Octtane Race": 15620, "ECU FT700": 12100, "ECU FT700 Plus": 12100,
  "ECU Race Dash": 12100, "ECU FT550": 6600,

  // Turbo / Sobrealimentação
  "Twin Turbo Race": 113850, "Biturbo Race": 95755, "Twin Turbo Drag": 94820, "Biturbo Street": 70895,
  "Twin Turbo Street": 55990, "Turbo Prototype": 49335, "Turbo Race Mid": 45045, "Turbo Race Top": 45045,
  "Turbo Street Mid": 34430, "Turbo Street Low": 26950,

  // Motor Interno
  "Bloco Billet": 72985, "Bloco de Ferro Fundido": 37950, "Bloco de Alumínio": 34815,
  "Pistão Titânio": 68695, "Pistão Forjado": 24805, "Pistão Fundido": 23760,
  "Biela Titânio": 43065, "Biela H-Beam": 39435, "Biela Forjada OEM": 38445,
  "Virabrequim Prototype": 36025, "Virabrequim Race": 30745, "Virabrequim Street": 30030, "Virabrequim Track": 30030,
  "Cabeçote CNC Billet": 28160, "Cabeçote Alumínio": 20240, "Cabeçote de Ferro": 19580,

  // Transmissão
  "Câmbio Prototype": 47905, "Câmbio Track": 36025, "Câmbio Race": 34760, "Câmbio Street": 28100,
  "Diferencial Prototype": 64075, "Diferencial Track": 45155, "Diferencial Race": 32450, "Diferencial Street": 27500,
  "Coroa e Pinhão Race": 24585, "Coroa e Pinhão Velocidade": 15840,
  "Coroa e Pinhão Aceleração": 12485, "Coroa e Pinhão Balanceado": 12485,

  // Admissão / Intake
  "Coletor Admissão Prototype": 35200, "Coletor Admissão Race": 29205,
  "Coletor Admissão Track": 23210, "Coletor Admissão Street": 13035,
  "Corpo Borboleta Prototype": 26730, "Corpo Borboleta Race": 20405,
  "Corpo Borboleta Track": 14025, "Corpo Borboleta Street": 9735,
  "Filtro Ar Prototype": 13915, "Filtro Ar Race": 8030, "Filtro Ar Track": 2200, "Filtro Ar Street": 990,

  // Arrefecimento
  "Intercooler Prototype": 66880, "Intercooler Race": 50765, "Intercooler Track": 34650, "Intercooler Street": 23155,
  "Radiador Prototype": 38665, "Radiador Race": 22550, "Radiador Track": 21670, "Radiador Street": 11055,
  "Radiador Óleo Prototype": 25135, "Radiador Óleo Race": 13695, "Radiador Óleo Track": 6820, "Radiador Óleo Street": 4950,

  // Escape
  "Escape Prototype": 76560, "Escape Race": 66495, "Escape Track": 56430, "Escape Street": 32670,

  // Combustível
  "Bomba Combustível Prototype": 10450, "Bomba Combustível Race": 6930,
  "Bomba Combustível Track": 4070, "Bomba Combustível Street": 1925,

  // Juntas
  "Junta Cabeçote Prototype": 4070, "Junta Cabeçote Track": 3630, "Junta Cabeçote Race": 2970, "Junta Cabeçote Street": 660,
};

function getPreco(nome) {
  return PRECOS[nome] || 0;
}

// ---------------------------------------------------------------------------
// CATEGORIAS DE PEÇAS — ordem de exibição na aba "Peças"
// ---------------------------------------------------------------------------
const PARTS_CATEGORIES = [
  "Bloco",
  "Virabrequim",
  "Pistão",
  "Biela",
  "Cabeçote",
  "Turbo",
  "Volante de Motor",
  "Radiador",
  "Câmbio",
  "Diferencial",
  "Montagem Eletrônica",
  "ECU",
  "Intercooler",
  "Radiador de Óleo",
  "Coletor de Admissão",
  "Corpo de Borboleta",
  "Filtro de Ar",
  "Escape",
  "Bomba de Combustível",
  "Junta do Cabeçote",
  "Moldes 3D",
];

// Ícone padrão exibido no card de cada categoria
const CATEGORY_ICONS = {
  "Bloco": "box",
  "Virabrequim": "rotate-cw",
  "Pistão": "circle-dot",
  "Biela": "link",
  "Cabeçote": "layers",
  "Turbo": "wind",
  "Volante de Motor": "disc",
  "Radiador": "grid-3x3",
  "Câmbio": "settings",
  "Diferencial": "git-merge",
  "Montagem Eletrônica": "circuit-board",
  "ECU": "cpu",
  "Intercooler": "snowflake",
  "Radiador de Óleo": "droplet",
  "Coletor de Admissão": "wind",
  "Corpo de Borboleta": "circle",
  "Filtro de Ar": "filter",
  "Escape": "flame",
  "Bomba de Combustível": "fuel",
  "Junta do Cabeçote": "square",
  "Moldes 3D": "printer",
};

// ---------------------------------------------------------------------------
// MOLDES CNC — peças brutas forjadas na CNC, usadas como base de outras peças
// Cada material aqui referencia (por nome) um item do BAÚ.
// ---------------------------------------------------------------------------
const MOLDES_CNC = [
  { id: "molde-bloco-aluminio-bruto",     nome: "Bloco de Alumínio Bruto",        materiais: [{ nome: "Pó de Alumínio", quantidade: 15 }, { nome: "Pó de Aço", quantidade: 4 }] },
  { id: "molde-bloco-ferro-bruto",        nome: "Bloco de Ferro Bruto",           materiais: [{ nome: "Pó de Alumínio", quantidade: 2 }, { nome: "Pó de Aço", quantidade: 13 }] },
  { id: "molde-cabecote-bruto",           nome: "Cabeçote Bruto",                 materiais: [{ nome: "Pó de Aço", quantidade: 2 }, { nome: "Pó de Alumínio", quantidade: 9 }] },
  { id: "molde-caixa-lateral-intercooler",nome: "Caixa Lateral de Intercooler",   materiais: [{ nome: "Pó de Alumínio", quantidade: 4 }] },
  { id: "molde-carcaca-cambio-bruto",     nome: "Carcaça de Câmbio Bruto",        materiais: [{ nome: "Pó de Aço", quantidade: 4 }, { nome: "Pó de Alumínio", quantidade: 10 }] },
  { id: "molde-carcaca-diferencial-bruta",nome: "Carcaça de Diferencial Bruta",   materiais: [{ nome: "Pó de Aço", quantidade: 8 }, { nome: "Pó de Alumínio", quantidade: 3 }] },
  { id: "molde-carcaca-turbo-media",      nome: "Carcaça de Turbo Média",         materiais: [{ nome: "Pó de Aço", quantidade: 3 }, { nome: "Pó de Alumínio", quantidade: 7 }] },
  { id: "molde-carcaca-turbo-pequena",    nome: "Carcaça de Turbo Pequena",       materiais: [{ nome: "Pó de Aço", quantidade: 2 }, { nome: "Pó de Alumínio", quantidade: 5 }] },
  { id: "molde-carcaca-turbo-race",       nome: "Carcaça de Turbo Race",          materiais: [{ nome: "Pó de Aço", quantidade: 5 }, { nome: "Pó de Alumínio", quantidade: 9 }] },
  { id: "molde-coletor-escape-bruto",     nome: "Coletor de Escape Bruto",        materiais: [{ nome: "Pó de Aço", quantidade: 7 }, { nome: "Pó de Alumínio", quantidade: 2 }] },
  { id: "molde-comando-bruto",            nome: "Comando Bruto",                  materiais: [{ nome: "Pó de Aço", quantidade: 7 }, { nome: "Pó de Alumínio", quantidade: 1 }] },
  { id: "molde-corpo-borboleta-bruto",    nome: "Corpo de Borboleta Bruto",       materiais: [{ nome: "Pó de Aço", quantidade: 1 }, { nome: "Pó de Alumínio", quantidade: 4 }] },
  { id: "molde-flauta-combustivel-bruta", nome: "Flauta de Combustível Bruta",    materiais: [{ nome: "Fio de Cobre", quantidade: 1 }, { nome: "Pó de Alumínio", quantidade: 4 }] },
  { id: "molde-biela-usinada",            nome: "Molde de Biela Usinada",         materiais: [{ nome: "Pó de Aço", quantidade: 3 }, { nome: "Pó de Alumínio", quantidade: 1 }] },
  { id: "molde-pistao-usinado",           nome: "Molde de Pistão Usinado",        materiais: [{ nome: "Pó de Aço", quantidade: 1 }, { nome: "Pó de Alumínio", quantidade: 2 }] },
  { id: "molde-nucleo-bruto-intercooler", nome: "Núcleo Bruto de Intercooler",    materiais: [{ nome: "Fio de Cobre", quantidade: 2 }, { nome: "Pó de Alumínio", quantidade: 6 }] },
  { id: "molde-nucleo-bruto-radiador",    nome: "Núcleo Bruto de Radiador",       materiais: [{ nome: "Fio de Cobre", quantidade: 2 }, { nome: "Pó de Alumínio", quantidade: 6 }] },
  { id: "molde-rotor-compressor",         nome: "Rotor Compressor",               materiais: [{ nome: "Pó de Aço", quantidade: 1 }, { nome: "Pó de Alumínio", quantidade: 4 }] },
  { id: "molde-virabrequim-bruto",        nome: "Virabrequim Bruto",              materiais: [{ nome: "Pó de Aço", quantidade: 10 }, { nome: "Pó de Alumínio", quantidade: 2 }] },
  { id: "molde-volante-motor-bruto",      nome: "Volante de Motor Bruto",         materiais: [{ nome: "Pó de Aço", quantidade: 6 }, { nome: "Pó de Alumínio", quantidade: 2 }] },
];

// ---------------------------------------------------------------------------
// PEÇAS — catálogo completo, agrupado por categoria (ordem de PARTS_CATEGORIES)
// materiais[].forjada = true  => item em destaque, com referência (ref) para
//   uma peça bruta (type:"molde", ver MOLDES_CNC) ou outra peça já forjada
//   (type:"parte", ver id abaixo).
// ---------------------------------------------------------------------------
const PARTS = [

  /* ------------------------------ BLOCO ------------------------------- */
  { id: "bloco-ferro-fundido", nome: "Bloco de Ferro Fundido", categoria: "Bloco",
    imagem: "assets/parts/bloco-ferro-fundido.png",
    materiais: [
      { nome: "Jogo de Bronzinas de Mancal", quantidade: 1 },
      { nome: "Bloco de Ferro Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-bloco-ferro-bruto" } },
    ] },
  { id: "bloco-aluminio", nome: "Bloco de Alumínio", categoria: "Bloco",
    materiais: [
      { nome: "Jogo de Bronzinas de Mancal", quantidade: 1 },
      { nome: "Bloco de Alumínio Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-bloco-aluminio-bruto" } },
    ] },
  { id: "bloco-billet", nome: "Bloco Billet", categoria: "Bloco",
    materiais: [
      { nome: "Jogo de Bronzinas de Mancal", quantidade: 1 },
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Bloco de Ferro Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-bloco-ferro-bruto" } },
      { nome: "Bloco de Alumínio Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-bloco-aluminio-bruto" } },
    ] },

  /* --------------------------- VIRABREQUIM ----------------------------- */
  { id: "virabrequim-track", nome: "Virabrequim Track", categoria: "Virabrequim",
    materiais: [
      { nome: "Jogo de Bronzinas de Mancal", quantidade: 1 },
      { nome: "Virabrequim Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-virabrequim-bruto" } },
    ] },
  { id: "virabrequim-street", nome: "Virabrequim Street", categoria: "Virabrequim",
    materiais: [
      { nome: "Jogo de Bronzinas de Mancal", quantidade: 1 },
      { nome: "Virabrequim Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-virabrequim-bruto" } },
    ] },
  { id: "virabrequim-race", nome: "Virabrequim Race", categoria: "Virabrequim",
    materiais: [
      { nome: "Jogo de Bronzinas de Mancal", quantidade: 1 },
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Virabrequim Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-virabrequim-bruto" } },
    ] },
  { id: "virabrequim-prototype", nome: "Virabrequim Prototype", categoria: "Virabrequim",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Virabrequim Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "virabrequim-race" } },
    ] },

  /* ------------------------------ PISTÃO ------------------------------- */
  { id: "pistao-forjado", nome: "Pistão Forjado", categoria: "Pistão",
    materiais: [
      { nome: "Jogo de Anéis de Pistão", quantidade: 1 },
      { nome: "Tratamento Forjado", quantidade: 1 },
      { nome: "Molde de Pistão Usinado", quantidade: 4, forjada: true, ref: { type: "molde", id: "molde-pistao-usinado" } },
    ] },
  { id: "pistao-fundido", nome: "Pistão Fundido", categoria: "Pistão",
    materiais: [
      { nome: "Jogo de Anéis de Pistão", quantidade: 1 },
      { nome: "Molde de Pistão Usinado", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-pistao-usinado" } },
    ] },
  { id: "pistao-titanio", nome: "Pistão Titânio", categoria: "Pistão",
    materiais: [
      { nome: "Barra de Prata", quantidade: 14 },
      { nome: "Barra de Titânio", quantidade: 2 },
      { nome: "Fio de Cobre", quantidade: 8 },
      { nome: "Jogo de Anéis de Pistão", quantidade: 1 },
      { nome: "Pó de Alumínio", quantidade: 4 },
      { nome: "Pó de Aço", quantidade: 2 },
      { nome: "Molde de Pistão Usinado", quantidade: 4, forjada: true, ref: { type: "molde", id: "molde-pistao-usinado" } },
    ] },

  /* ------------------------------- BIELA -------------------------------- */
  { id: "biela-forjada-oem", nome: "Biela Forjada OEM", categoria: "Biela",
    materiais: [
      { nome: "Jogo de Bronzinas de Biela", quantidade: 1 },
      { nome: "Molde de Biela Usinada", quantidade: 4, forjada: true, ref: { type: "molde", id: "molde-biela-usinada" } },
    ] },
  { id: "biela-h-beam", nome: "Biela H-Beam", categoria: "Biela",
    materiais: [
      { nome: "Jogo de Bronzinas de Biela", quantidade: 1 },
      { nome: "Tratamento Forjado", quantidade: 1 },
      { nome: "Molde de Biela Usinada", quantidade: 4, forjada: true, ref: { type: "molde", id: "molde-biela-usinada" } },
    ] },
  { id: "biela-titanio", nome: "Biela Titânio", categoria: "Biela",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Jogo de Bronzinas de Biela", quantidade: 1 },
      { nome: "Molde de Biela Usinada", quantidade: 4, forjada: true, ref: { type: "molde", id: "molde-biela-usinada" } },
    ] },

  /* ----------------------------- CABEÇOTE -------------------------------- */
  { id: "cabecote-ferro", nome: "Cabeçote de Ferro", categoria: "Cabeçote",
    materiais: [
      { nome: "Cabeçote Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-cabecote-bruto" } },
    ] },
  { id: "cabecote-aluminio", nome: "Cabeçote Alumínio", categoria: "Cabeçote",
    materiais: [
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Cabeçote Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-cabecote-bruto" } },
    ] },
  { id: "cabecote-cnc-billet", nome: "Cabeçote CNC Billet", categoria: "Cabeçote",
    materiais: [
      { nome: "Pó de Aço", quantidade: 3 },
      { nome: "Cabeçote Alumínio", quantidade: 1, forjada: true, ref: { type: "parte", id: "cabecote-aluminio" } },
    ] },

  /* ------------------------------- TURBO --------------------------------- */
  { id: "twin-turbo-drag", nome: "Twin Turbo Drag", subtitulo: "Twin Turbo GT35.82", categoria: "Turbo",
    materiais: [
      { nome: "Abraçadeira V-Band", quantidade: 6 },
      { nome: "Controlador de Pressão", quantidade: 2 },
      { nome: "Rolamento Cerâmico", quantidade: 1 },
      { nome: "Turbo Race Top", quantidade: 2, forjada: true, ref: { type: "parte", id: "turbo-race-top" } },
    ] },
  { id: "turbo-race-top", nome: "Turbo Race Top", subtitulo: "TURBO GT35.82", categoria: "Turbo",
    materiais: [
      { nome: "Carcaça Race", quantidade: 1 },
      { nome: "Controlador de Pressão", quantidade: 1 },
      { nome: "Núcleo de Turbo", quantidade: 1 },
      { nome: "Rolamento Cerâmico", quantidade: 1 },
      { nome: "Wastegate", quantidade: 1 },
      { nome: "Rotor Compressor", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-rotor-compressor" } },
    ] },
  { id: "turbo-street-low", nome: "Turbo Street Low", subtitulo: "Turbo T25.48", categoria: "Turbo",
    materiais: [
      { nome: "Núcleo de Turbo", quantidade: 1 },
      { nome: "Carcaça de Turbo Pequena", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-carcaca-turbo-pequena" } },
      { nome: "Rotor Compressor", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-rotor-compressor" } },
    ] },
  { id: "turbo-street-mid", nome: "Turbo Street Mid", subtitulo: "Turbo T28.64", categoria: "Turbo",
    materiais: [
      { nome: "Núcleo de Turbo", quantidade: 1 },
      { nome: "Wastegate", quantidade: 1 },
      { nome: "Carcaça de Turbo Pequena", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-carcaca-turbo-pequena" } },
      { nome: "Rotor Compressor", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-rotor-compressor" } },
    ] },
  { id: "turbo-race-mid", nome: "Turbo Race Mid", subtitulo: "Turbo GT30.82", categoria: "Turbo",
    materiais: [
      { nome: "Núcleo de Turbo", quantidade: 1 },
      { nome: "Controlador de Pressão", quantidade: 1 },
      { nome: "Rolamento Cerâmico", quantidade: 1 },
      { nome: "Wastegate", quantidade: 1 },
      { nome: "Carcaça de Turbo Race", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-carcaca-turbo-race" } },
      { nome: "Rotor Compressor", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-rotor-compressor" } },
    ] },
  { id: "turbo-prototype", nome: "Turbo Prototype", subtitulo: "Twin Turbo TSX 6262", categoria: "Turbo",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Controlador de Pressão", quantidade: 1 },
      { nome: "Núcleo Twin Scroll", quantidade: 1 },
      { nome: "Rolamento Cerâmico", quantidade: 1 },
      { nome: "Carcaça de Turbo Race", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-carcaca-turbo-race" } },
      { nome: "Rotor Compressor", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-rotor-compressor" } },
    ] },
  { id: "twin-turbo-street", nome: "Twin Turbo Street", subtitulo: "Twin Turbo T25.48", categoria: "Turbo",
    materiais: [
      { nome: "Abraçadeira V-Band", quantidade: 6 },
      { nome: "Controlador de Pressão", quantidade: 1 },
      { nome: "Turbo Street Low", quantidade: 2, forjada: true, ref: { type: "parte", id: "turbo-street-low" } },
    ] },
  { id: "biturbo-street", nome: "Biturbo Street", subtitulo: "Biturbo T28.64", categoria: "Turbo",
    materiais: [
      { nome: "Abraçadeira V-Band", quantidade: 4 },
      { nome: "Controlador de Pressão", quantidade: 1 },
      { nome: "Turbo Street Mid", quantidade: 2, forjada: true, ref: { type: "parte", id: "turbo-street-mid" } },
    ] },
  { id: "twin-turbo-race", nome: "Twin Turbo Race", subtitulo: "Twin Turbo GT30.82", categoria: "Turbo",
    materiais: [
      { nome: "Abraçadeira V-Band", quantidade: 4 },
      { nome: "Coletor de Escapamento", quantidade: 1 },
      { nome: "Controlador de Pressão", quantidade: 1 },
      { nome: "Turbo Race Mid", quantidade: 2, forjada: true, ref: { type: "parte", id: "turbo-race-mid" } },
    ] },
  { id: "biturbo-race", nome: "Biturbo Race", subtitulo: "Biturbo GT35.82", categoria: "Turbo",
    materiais: [
      { nome: "Abraçadeira V-Band", quantidade: 6 },
      { nome: "Controlador de Pressão", quantidade: 2 },
      { nome: "Rolamento Cerâmico", quantidade: 2 },
      { nome: "Turbo Race Top", quantidade: 2, forjada: true, ref: { type: "parte", id: "turbo-race-top" } },
    ] },

  /* -------------------------- VOLANTE DE MOTOR ---------------------------- */
  { id: "volante-motor-street", nome: "Volante Motor Street", subtitulo: "Volante Aliviado Street", categoria: "Volante de Motor",
    materiais: [
      { nome: "Volante de Motor Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-volante-motor-bruto" } },
    ] },
  { id: "volante-motor-track", nome: "Volante Motor Track", subtitulo: "Volante Alumínio Track", categoria: "Volante de Motor",
    materiais: [
      { nome: "Volante Motor Street", quantidade: 1, forjada: true, ref: { type: "parte", id: "volante-motor-street" } },
      { nome: "Volante de Motor Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-volante-motor-bruto" } },
    ] },
  { id: "volante-motor-race", nome: "Volante Motor Race", subtitulo: "Volante Racing Billet", categoria: "Volante de Motor",
    materiais: [
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Volante Motor Track", quantidade: 1, forjada: true, ref: { type: "parte", id: "volante-motor-track" } },
      { nome: "Volante de Motor Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-volante-motor-bruto" } },
    ] },
  { id: "volante-motor-prototype", nome: "Volante Motor Prototype", subtitulo: "Volante Protótipo Titânio", categoria: "Volante de Motor",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Volante Motor Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "volante-motor-race" } },
      { nome: "Volante de Motor Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-volante-motor-bruto" } },
    ] },

  /* ------------------------------ RADIADOR -------------------------------- */
  { id: "radiador-race", nome: "Radiador Race", subtitulo: "Radiador Racing Track", categoria: "Radiador",
    materiais: [
      { nome: "Mangote de Silicone", quantidade: 4 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Tampa Pressurizada", quantidade: 1 },
      { nome: "Ventoinha Slim", quantidade: 2 },
      { nome: "Núcleo Bruto de Radiador", quantidade: 2, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-radiador" } },
    ] },
  { id: "radiador-prototype", nome: "Radiador Prototype", subtitulo: "Radiador Protótipo Racing", categoria: "Radiador",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Ventoinha Slim", quantidade: 2 },
      { nome: "Radiador Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "radiador-race" } },
      { nome: "Núcleo Bruto de Radiador", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-radiador" } },
    ] },

  /* ------------------------------- CÂMBIO --------------------------------- */
  { id: "cambio-prototype", nome: "Câmbio Prototype", categoria: "Câmbio",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Câmbio Auto 6 Marchas", quantidade: 1 },
      { nome: "Engrenagens Race", quantidade: 1 },
      { nome: "Jogo de Sincronizadores", quantidade: 2 },
      { nome: "Kit de Embreagem", quantidade: 2 },
    ] },
  { id: "coroa-pinhao-velocidade", nome: "Coroa e Pinhão Velocidade", categoria: "Câmbio",
    materiais: [
      { nome: "Engrenagem Street", quantidade: 1 },
      { nome: "Pó de Aço", quantidade: 5 },
      { nome: "Tratamento Térmico", quantidade: 1 },
    ] },
  { id: "coroa-pinhao-race", nome: "Coroa e Pinhão Race", categoria: "Câmbio",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Engrenagens Race", quantidade: 1 },
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Coroa e Pinhão Velocidade", quantidade: 1, forjada: true, ref: { type: "parte", id: "coroa-pinhao-velocidade" } },
    ] },
  { id: "coroa-pinhao-balanceado", nome: "Coroa e Pinhão Balanceado", categoria: "Câmbio",
    materiais: [
      { nome: "Engrenagem Street", quantidade: 1 },
      { nome: "Pó de Aço", quantidade: 4 },
    ] },
  { id: "coroa-pinhao-aceleracao", nome: "Coroa e Pinhão Aceleração", categoria: "Câmbio",
    materiais: [
      { nome: "Engrenagem Street", quantidade: 1 },
      { nome: "Pó de Aço", quantidade: 4 },
    ] },

  /* ----------------------------- DIFERENCIAL ------------------------------ */
  { id: "diferencial-race", nome: "Diferencial Race", categoria: "Diferencial",
    materiais: [
      { nome: "Engrenagens Race", quantidade: 1 },
      { nome: "Núcleo LSD", quantidade: 1 },
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Carcaça de Diferencial Bruta", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-carcaca-diferencial-bruta" } },
    ] },
  { id: "diferencial-prototype", nome: "Diferencial Prototype", categoria: "Diferencial",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Núcleo LSD", quantidade: 1 },
      { nome: "Coroa e Pinhão Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "coroa-pinhao-race" } },
      { nome: "Diferencial Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "diferencial-race" } },
    ] },

  /* ------------------------- MONTAGEM ELETRÔNICA -------------------------- */
  { id: "placa-conectora-ecu", nome: "Placa Conectora de ECU", categoria: "Montagem Eletrônica",
    materiais: [
      { nome: "Barra de Prata", quantidade: 1 },
      { nome: "Componente Eletrônico", quantidade: 3 },
      { nome: "Filamento Plástico", quantidade: 1 },
      { nome: "Fio de Cobre", quantidade: 1 },
    ] },
  { id: "placa-ecu-ecumaster", nome: "Placa ECU Ecumaster", categoria: "Montagem Eletrônica",
    materiais: [
      { nome: "Barra de Prata", quantidade: 4 },
      { nome: "Componente Eletrônico", quantidade: 7 },
      { nome: "Conector Selado", quantidade: 2 },
      { nome: "Fio de Cobre", quantidade: 2 },
      { nome: "Gateway CAN", quantidade: 1 },
    ] },
  { id: "placa-ecu-octtane", nome: "Placa ECU Octtane", categoria: "Montagem Eletrônica",
    materiais: [
      { nome: "Barra de Prata", quantidade: 2 },
      { nome: "Componente Eletrônico", quantidade: 5 },
      { nome: "Conector Selado", quantidade: 1 },
      { nome: "Fio de Cobre", quantidade: 1 },
    ] },

  /* --------------------------------- ECU ----------------------------------- */
  { id: "ecu-ecumaster", nome: "ECU Ecumaster", categoria: "ECU",
    materiais: [
      { nome: "Barra de Prata", quantidade: 15 },
      { nome: "Chip de Firmware", quantidade: 1 },
      { nome: "Componente Eletrônico", quantidade: 14 },
      { nome: "Controlador Wideband", quantidade: 1 },
      { nome: "Fio de Cobre", quantidade: 8 },
      { nome: "Gateway CAN", quantidade: 1 },
      { nome: "Módulo Processador", quantidade: 1 },
      { nome: "Sensor MAP 4 Bar", quantidade: 1 },
      { nome: "Tela Ecumaster", quantidade: 1 },
      { nome: "Carcaça ECU Ecumaster", quantidade: 1, forjada: true, ref: { type: "parte", id: "carcaca-ecu-ecumaster" } },
      { nome: "Placa ECU Ecumaster", quantidade: 1, forjada: true, ref: { type: "parte", id: "placa-ecu-ecumaster" } },
    ] },
  { id: "ecu-ft550", nome: "ECU FT550", categoria: "ECU",
    materiais: [
      { nome: "Componente Eletrônico", quantidade: 4 },
      { nome: "Tela FT450", quantidade: 1 },
      { nome: "Base de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "base-ecu" } },
      { nome: "Placa Conectora de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "placa-conectora-ecu" } },
      { nome: "Suporte de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "suporte-ecu" } },
    ] },
  { id: "ecu-ft700", nome: "ECU FT700", categoria: "ECU",
    materiais: [
      { nome: "Chip de Firmware", quantidade: 1 },
      { nome: "Componente Eletrônico", quantidade: 10 },
      { nome: "Conector Selado", quantidade: 1 },
      { nome: "Módulo Processador", quantidade: 1 },
      { nome: "Tela FT700", quantidade: 1 },
      { nome: "Base de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "base-ecu" } },
      { nome: "Placa Conectora de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "placa-conectora-ecu" } },
      { nome: "Suporte de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "suporte-ecu" } },
    ] },
  { id: "ecu-ft700-plus", nome: "ECU FT700 Plus", categoria: "ECU",
    materiais: [
      { nome: "Chip de Firmware", quantidade: 1 },
      { nome: "Componente Eletrônico", quantidade: 10 },
      { nome: "Conector Selado", quantidade: 1 },
      { nome: "Módulo Processador", quantidade: 1 },
      { nome: "Tela FT700", quantidade: 1 },
      { nome: "Base de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "base-ecu" } },
      { nome: "Placa Conectora de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "placa-conectora-ecu" } },
      { nome: "Suporte de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "suporte-ecu" } },
    ] },
  { id: "ecu-octtane-race", nome: "ECU Octtane Race", categoria: "ECU",
    materiais: [
      { nome: "Chicote de ECU", quantidade: 1 },
      { nome: "Componente Eletrônico", quantidade: 10 },
      { nome: "Controlador Wideband", quantidade: 1 },
      { nome: "Módulo Processador", quantidade: 1 },
      { nome: "Sensor MAP 4 Bar", quantidade: 1 },
      { nome: "Tela Octtane", quantidade: 1 },
      { nome: "Carcaça ECU Octtane", quantidade: 1, forjada: true, ref: { type: "parte", id: "carcaca-ecu-octtane" } },
      { nome: "Placa ECU Octtane", quantidade: 1, forjada: true, ref: { type: "parte", id: "placa-ecu-octtane" } },
    ] },
  { id: "ecu-race-dash", nome: "ECU Race Dash", categoria: "ECU",
    materiais: [
      { nome: "Chip de Firmware", quantidade: 1 },
      { nome: "Componente Eletrônico", quantidade: 10 },
      { nome: "Conector Selado", quantidade: 1 },
      { nome: "Módulo Processador", quantidade: 1 },
      { nome: "Tela FT700", quantidade: 1 },
      { nome: "Base de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "base-ecu" } },
      { nome: "Placa Conectora de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "placa-conectora-ecu" } },
      { nome: "Suporte de ECU", quantidade: 1, forjada: true, ref: { type: "parte", id: "suporte-ecu" } },
    ] },

  /* ----------------------------- INTERCOOLER ------------------------------- */
  { id: "intercooler-street", nome: "Intercooler Street", categoria: "Intercooler",
    materiais: [
      { nome: "Mangote de Silicone", quantidade: 2 },
      { nome: "Caixa Lateral de Intercooler", quantidade: 2, forjada: true, ref: { type: "molde", id: "molde-caixa-lateral-intercooler" } },
      { nome: "Núcleo Bruto de Intercooler", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-intercooler" } },
    ] },
  { id: "intercooler-track", nome: "Intercooler Track", categoria: "Intercooler",
    materiais: [
      { nome: "Mangote de Silicone", quantidade: 4 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Duto de Intercooler", quantidade: 1, forjada: true, ref: { type: "parte", id: "duto-intercooler" } },
      { nome: "Caixa Lateral de Intercooler", quantidade: 2, forjada: true, ref: { type: "molde", id: "molde-caixa-lateral-intercooler" } },
      { nome: "Núcleo Bruto de Intercooler", quantidade: 2, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-intercooler" } },
    ] },
  { id: "intercooler-race", nome: "Intercooler Race", categoria: "Intercooler",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Mangote de Silicone", quantidade: 4 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Intercooler Track", quantidade: 1, forjada: true, ref: { type: "parte", id: "intercooler-track" } },
      { nome: "Núcleo Bruto de Intercooler", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-intercooler" } },
    ] },
  { id: "intercooler-prototype", nome: "Intercooler Prototype", categoria: "Intercooler",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Mangote de Silicone", quantidade: 4 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Intercooler Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "intercooler-race" } },
      { nome: "Núcleo Bruto de Intercooler", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-intercooler" } },
    ] },

  /* --------------------------- RADIADOR DE ÓLEO ----------------------------- */
  { id: "radiador-oleo-street", nome: "Radiador Óleo Street", categoria: "Radiador de Óleo",
    materiais: [
      { nome: "Mangote de Silicone", quantidade: 2 },
      { nome: "Núcleo Bruto de Radiador", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-radiador" } },
    ] },
  { id: "radiador-oleo-track", nome: "Radiador Óleo Track", categoria: "Radiador de Óleo",
    materiais: [
      { nome: "Mangote de Silicone", quantidade: 3 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Núcleo Bruto de Radiador", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-radiador" } },
    ] },
  { id: "radiador-oleo-race", nome: "Radiador Óleo Race", categoria: "Radiador de Óleo",
    materiais: [
      { nome: "Mangote de Silicone", quantidade: 4 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Tampa Pressurizada", quantidade: 1 },
      { nome: "Núcleo Bruto de Radiador", quantidade: 2, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-radiador" } },
    ] },
  { id: "radiador-oleo-prototype", nome: "Radiador Óleo Prototype", categoria: "Radiador de Óleo",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Radiador Óleo Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "radiador-oleo-race" } },
      { nome: "Núcleo Bruto de Radiador", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-nucleo-bruto-radiador" } },
    ] },

  /* --------------------------- COLETOR DE ADMISSÃO -------------------------- */
  { id: "coletor-admissao-street", nome: "Coletor Admissão Street", categoria: "Coletor de Admissão",
    materiais: [{ nome: "Mangote de Silicone", quantidade: 1 }, { nome: "Pó de Alumínio", quantidade: 4 }] },
  { id: "coletor-admissao-track", nome: "Coletor Admissão Track", categoria: "Coletor de Admissão",
    materiais: [{ nome: "Mangote de Silicone", quantidade: 2 }, { nome: "Pó de Alumínio", quantidade: 6 }] },
  { id: "coletor-admissao-race", nome: "Coletor Admissão Race", categoria: "Coletor de Admissão",
    materiais: [{ nome: "Mangote de Silicone", quantidade: 2 }, { nome: "Sensor de Pressão", quantidade: 1 }, { nome: "Pó de Alumínio", quantidade: 9 }] },
  { id: "coletor-admissao-prototype", nome: "Coletor Admissão Prototype", categoria: "Coletor de Admissão",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Coletor Admissão Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "coletor-admissao-race" } },
    ] },

  /* ---------------------------- CORPO DE BORBOLETA --------------------------- */
  { id: "corpo-borboleta-street", nome: "Corpo Borboleta Street", categoria: "Corpo de Borboleta",
    materiais: [
      { nome: "Corpo de Borboleta Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-corpo-borboleta-bruto" } },
    ] },
  { id: "corpo-borboleta-track", nome: "Corpo Borboleta Track", categoria: "Corpo de Borboleta",
    materiais: [
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Corpo de Borboleta Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-corpo-borboleta-bruto" } },
    ] },
  { id: "corpo-borboleta-race", nome: "Corpo Borboleta Race", categoria: "Corpo de Borboleta",
    materiais: [
      { nome: "Sensor de Pressão", quantidade: 1 },
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Corpo de Borboleta Bruto", quantidade: 2, forjada: true, ref: { type: "molde", id: "molde-corpo-borboleta-bruto" } },
    ] },
  { id: "corpo-borboleta-prototype", nome: "Corpo Borboleta Prototype", categoria: "Corpo de Borboleta",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Corpo Borboleta Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "corpo-borboleta-race" } },
      { nome: "Corpo de Borboleta Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-corpo-borboleta-bruto" } },
    ] },

  /* ------------------------------- FILTRO DE AR ------------------------------ */
  { id: "filtro-ar-street", nome: "Filtro Ar Street", categoria: "Filtro de Ar",
    materiais: [{ nome: "Filamento Plástico", quantidade: 2 }, { nome: "Composto de Borracha", quantidade: 1 }] },
  { id: "filtro-ar-track", nome: "Filtro Ar Track", categoria: "Filtro de Ar",
    materiais: [{ nome: "Filamento Plástico", quantidade: 3 }, { nome: "Composto de Borracha", quantidade: 1 }] },
  { id: "filtro-ar-race", nome: "Filtro Ar Race", categoria: "Filtro de Ar",
    materiais: [{ nome: "Filamento Plástico", quantidade: 5 }, { nome: "Composto de Borracha", quantidade: 2 }] },
  { id: "filtro-ar-prototype", nome: "Filtro Ar Prototype", categoria: "Filtro de Ar",
    materiais: [{ nome: "Barra de Titânio", quantidade: 1 }, { nome: "Filamento Plástico", quantidade: 6 }, { nome: "Composto de Borracha", quantidade: 2 }] },

  /* ---------------------------------- ESCAPE --------------------------------- */
  { id: "escape-street", nome: "Escape Street", categoria: "Escape",
    materiais: [
      { nome: "Abraçadeira V-Band", quantidade: 2 },
      { nome: "Coletor de Escape Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-coletor-escape-bruto" } },
    ] },
  { id: "escape-track", nome: "Escape Track", categoria: "Escape",
    materiais: [
      { nome: "Abraçadeira V-Band", quantidade: 3 },
      { nome: "Coletor de Escape Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-coletor-escape-bruto" } },
    ] },
  { id: "escape-race", nome: "Escape Race", categoria: "Escape",
    materiais: [
      { nome: "Abraçadeira V-Band", quantidade: 4 },
      { nome: "Tratamento Térmico", quantidade: 1 },
      { nome: "Coletor de Escape Bruto", quantidade: 2, forjada: true, ref: { type: "molde", id: "molde-coletor-escape-bruto" } },
    ] },
  { id: "escape-prototype", nome: "Escape Prototype", categoria: "Escape",
    materiais: [
      { nome: "Barra de Titânio", quantidade: 1 },
      { nome: "Abraçadeira V-Band", quantidade: 4 },
      { nome: "Escape Race", quantidade: 1, forjada: true, ref: { type: "parte", id: "escape-race" } },
      { nome: "Coletor de Escape Bruto", quantidade: 1, forjada: true, ref: { type: "molde", id: "molde-coletor-escape-bruto" } },
    ] },

  /* ---------------------------- BOMBA DE COMBUSTÍVEL ------------------------- */
  { id: "bomba-combustivel-street", nome: "Bomba Combustível Street", categoria: "Bomba de Combustível",
    materiais: [{ nome: "Componente Eletrônico", quantidade: 2 }, { nome: "Mangote de Silicone", quantidade: 1 }] },
  { id: "bomba-combustivel-track", nome: "Bomba Combustível Track", categoria: "Bomba de Combustível",
    materiais: [{ nome: "Componente Eletrônico", quantidade: 3 }, { nome: "Mangote de Silicone", quantidade: 2 }] },
  { id: "bomba-combustivel-race", nome: "Bomba Combustível Race", categoria: "Bomba de Combustível",
    materiais: [{ nome: "Componente Eletrônico", quantidade: 4 }, { nome: "Fio de Cobre", quantidade: 1 }, { nome: "Mangote de Silicone", quantidade: 2 }] },
  { id: "bomba-combustivel-prototype", nome: "Bomba Combustível Prototype", categoria: "Bomba de Combustível",
    materiais: [{ nome: "Barra de Titânio", quantidade: 1 }, { nome: "Componente Eletrônico", quantidade: 5 }, { nome: "Fio de Cobre", quantidade: 1 }] },

  /* ------------------------------ JUNTA DO CABEÇOTE --------------------------- */
  { id: "junta-cabecote-street", nome: "Junta Cabeçote Street", categoria: "Junta do Cabeçote",
    materiais: [{ nome: "Composto de Borracha", quantidade: 1 }] },
  { id: "junta-cabecote-race", nome: "Junta Cabeçote Race", categoria: "Junta do Cabeçote",
    materiais: [{ nome: "Composto de Borracha", quantidade: 2 }, { nome: "Pó de Aço", quantidade: 1 }] },
  { id: "junta-cabecote-track", nome: "Junta Cabeçote Track", categoria: "Junta do Cabeçote",
    materiais: [{ nome: "Composto de Borracha", quantidade: 2 }, { nome: "Pó de Aço", quantidade: 2 }] },
  { id: "junta-cabecote-prototype", nome: "Junta Cabeçote Prototype", categoria: "Junta do Cabeçote",
    materiais: [{ nome: "Barra de Titânio", quantidade: 1 }, { nome: "Composto de Borracha", quantidade: 2 }, { nome: "Pó de Aço", quantidade: 2 }] },

  /* ----------------------------- MOLDES 3D --------------------------------- */
  { id: "base-ecu", nome: "Base de ECU", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 4 }, { nome: "Composto de Borracha", quantidade: 1 }] },
  { id: "caixa-filtro-esportiva", nome: "Caixa de Filtro Esportiva", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 6 }, { nome: "Composto de Borracha", quantidade: 2 }] },
  { id: "caixa-fusiveis", nome: "Caixa de Fusíveis", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 5 }, { nome: "Composto de Borracha", quantidade: 1 }] },
  { id: "carcaca-ecu-octtane", nome: "Carcaça ECU Octtane", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 5 }, { nome: "Composto de Borracha", quantidade: 1 }] },
  { id: "carcaca-ecu-ecumaster", nome: "Carcaça ECU Ecumaster", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 6 }, { nome: "Composto de Borracha", quantidade: 1 }] },
  { id: "carcaca-sensor", nome: "Carcaça de Sensor", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 2 }, { nome: "Composto de Borracha", quantidade: 1 }] },
  { id: "duto-admissao", nome: "Duto de Admissão", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 8 }, { nome: "Composto de Borracha", quantidade: 2 }] },
  { id: "duto-intercooler", nome: "Duto de Intercooler", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 5 }, { nome: "Composto de Borracha", quantidade: 2 }] },
  { id: "moldura-filtro", nome: "Moldura de Filtro", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 4 }, { nome: "Composto de Borracha", quantidade: 2 }] },
  { id: "suporte-ecu", nome: "Suporte de ECU", categoria: "Moldes 3D",
    materiais: [{ nome: "Filamento Plástico", quantidade: 3 }, { nome: "Composto de Borracha", quantidade: 2 }] },
];

// ---------------------------------------------------------------------------
// AVISOS — mensagens exibidas no Dashboard
// ---------------------------------------------------------------------------
const GARAGE_NOTICES = [
  {
    id: 1,
    tipo: "alerta",
    titulo: "Estoque de Titânio baixo",
    mensagem: "Restam apenas 8 unidades de Titânio e 3 barras. Priorize reposição antes de novas forjas de peças de Titânio.",
    data: "2026-07-29",
  },
  {
    id: 2,
    tipo: "info",
    titulo: "Nova leva de Barras de Aço recebida",
    mensagem: "Chegaram 40 unidades de Barra de Aço no depósito. Estoque atualizado no Baú.",
    data: "2026-07-29",
  },
  {
    id: 3,
    tipo: "sucesso",
    titulo: "Catálogo de peças atualizado",
    mensagem: "O catálogo de Peças e a aba Moldes CNC foram reorganizados com as receitas completas da oficina.",
    data: "2026-07-27",
  },
];
