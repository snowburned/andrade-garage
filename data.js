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
  { id: "cobre",          nome: "Cobre",           categoria: "Minérios",        quantidade: 45,  ultimaAtualizacao: "2026-07-27" },
  { id: "ferro",           nome: "Ferro",           categoria: "Minérios",        quantidade: 120, ultimaAtualizacao: "2026-07-28" },
  { id: "aco",             nome: "Aço",             categoria: "Minérios",        quantidade: 80,  ultimaAtualizacao: "2026-07-28" },
  { id: "prata",           nome: "Prata",           categoria: "Minérios",        quantidade: 12,  ultimaAtualizacao: "2026-07-25" },
  { id: "titanio",         nome: "Titânio",         categoria: "Minérios",        quantidade: 8,   ultimaAtualizacao: "2026-07-24" },

  // Barras
  { id: "barra-cobre",     nome: "Barra de Cobre",  categoria: "Barras",          quantidade: 30,  ultimaAtualizacao: "2026-07-27" },
  { id: "barra-ferro",     nome: "Barra de Ferro",  categoria: "Barras",          quantidade: 60,  ultimaAtualizacao: "2026-07-28" },
  { id: "barra-aco",       nome: "Barra de Aço",    categoria: "Barras",          quantidade: 40,  ultimaAtualizacao: "2026-07-29" },
  { id: "barra-prata",     nome: "Barra de Prata",  categoria: "Barras",          quantidade: 5,   ultimaAtualizacao: "2026-07-22" },
  { id: "barra-titanio",   nome: "Barra de Titânio",categoria: "Barras",          quantidade: 3,   ultimaAtualizacao: "2026-07-20" },

  // Barras Refinadas
  { id: "fio-cobre",       nome: "Fio de Cobre",    categoria: "Barras Refinadas", quantidade: 25, ultimaAtualizacao: "2026-07-26" },
  { id: "po-aluminio",     nome: "Pó de Alumínio",  categoria: "Barras Refinadas", quantidade: 15, ultimaAtualizacao: "2026-07-23" },
  { id: "po-aco",          nome: "Pó de Aço",       categoria: "Barras Refinadas", quantidade: 20, ultimaAtualizacao: "2026-07-27" },
];

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
