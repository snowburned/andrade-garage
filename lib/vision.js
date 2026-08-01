/* ==========================================================================
   ANDRADE GARAGE — lib/vision.js
   Adaptador de visão computacional pra importar o Baú por imagem.

   Por que Gemini: é o único provedor grande com um plano gratuito real pra
   visão computacional (sem cartão de crédito, sem cobrança por uso) — veja
   README.md para os detalhes e limites. Se um dia precisar trocar de
   provedor (outro modelo gratuito, um modelo local via Ollama, etc.), a
   meta é: reescrever só a função analyzeInventoryImage() abaixo. Nada em
   api/import-bau-image.js nem no frontend depende de nenhum detalhe do
   Gemini — todo mundo só espera sempre o mesmo formato de retorno:

     { items: [ { name, quantity, confidence, position } ] }
   ========================================================================== */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { type: "integer" },
          confidence: { type: "number" },
          position: { type: "string" },
        },
        required: ["name", "quantity", "confidence"],
      },
    },
  },
  required: ["items"],
};

const PROMPT = `Você está analisando um print (captura de tela) do inventário/baú ("STORAGE") de um jogo de simulação de oficina mecânica (crafting/forja).

Cada slot preenchido tem, tipicamente: um rótulo de texto com o NOME do item embaixo do ícone (às vezes cortado com "..." por falta de espaço), um peso por unidade (ex: "200g", "1.5kg" — IGNORE isso, não é a quantidade), e um multiplicador de pilha no canto (ex: "2x", "12x", "956x") — ESSE multiplicador é a QUANTIDADE real do item no baú, não o peso.

Para cada slot preenchido, retorne:
- name: o nome do item exatamente como está escrito no rótulo de texto (não invente com base só no ícone). Se o texto estiver cortado com "...", use o texto completo mais provável considerando o ícone e o contexto (ex: "MINÉRIO DE FE..." com ícone de minério cinza-avermelhado é quase certamente "Minério de Ferro"). Priorize sempre o texto lido sobre a aparência do ícone.
- quantity: o número do multiplicador de pilha (o "Nx" no canto do ícone). NUNCA use o peso (g/kg) como quantidade. Se não houver nenhum número de pilha visível, use 1.
- confidence: de 0 a 1, o quão confiante você está tanto no nome quanto na quantidade lida. Use valores abaixo de 0.6 sempre que o texto estiver cortado de um jeito ambíguo, o ícone for pouco claro, ou o número da pilha estiver difícil de ler.
- position: opcional, a posição do slot na grade (ex: "linha 1, coluna 3"), só se der pra identificar visualmente uma grade de slots.

Ignore slots vazios (sem ícone). Não invente itens que não existem na imagem. Responda só com o JSON pedido.`;

async function analyzeInventoryImage({ base64, mimeType }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY não configurada.");
    err.code = "NO_API_KEY";
    throw err;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: PROMPT }, { inlineData: { mimeType, data: base64 } }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Gemini API respondeu ${res.status}: ${text.slice(0, 300)}`);
    err.code = res.status === 429 ? "RATE_LIMITED" : "PROVIDER_ERROR";
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const err = new Error("A IA não retornou nenhum conteúdo (a imagem pode ter sido bloqueada por segurança).");
    err.code = "EMPTY_RESPONSE";
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const err = new Error("A IA não retornou um JSON válido.");
    err.code = "BAD_JSON";
    throw err;
  }

  const rawItems = Array.isArray(parsed.items) ? parsed.items : [];

  return {
    items: rawItems
      .filter((it) => it && typeof it.name === "string" && it.name.trim())
      .map((it) => ({
        name: it.name.trim().slice(0, 60),
        quantity: Number.isFinite(it.quantity) ? Math.max(0, Math.round(it.quantity)) : 1,
        confidence: Number.isFinite(it.confidence) ? Math.min(1, Math.max(0, it.confidence)) : 0.5,
        position: typeof it.position === "string" && it.position.trim() ? it.position.trim().slice(0, 40) : null,
      }))
      .slice(0, 200),
  };
}

module.exports = { analyzeInventoryImage };