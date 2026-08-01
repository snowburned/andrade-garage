# ANDRADE GARAGE — Painel Interno

Painel interno de estoque e forjas da ANDRADE GARAGE (Street Car Club RP),
agora com **login real**, protegido por senha, com os usuários guardados
em um banco Postgres na **Neon**.

> ⚠️ Como o login precisa de um backend (para falar com o banco em
> segredo), o site **não pode mais rodar só no GitHub Pages** — o GitHub
> Pages só serve arquivos estáticos, sem rodar código de servidor. O jeito
> mais simples e gratuito de hospedar isso é a **Vercel** (instruções abaixo).

## Estrutura

```
index.html        → painel principal (protegido por login)
admin.html         → painel de administração de imagens (protegido por login)
login.html         → tela de login
auth-guard.js       → script incluído em toda página protegida, checa a sessão
style.css / admin.css / script.js / admin.js / data.js → como antes

api/
  login.js          → verifica usuário/senha no banco e cria a sessão (cookie)
  logout.js         → apaga a sessão
  me.js             → diz se a sessão atual é válida (e devolve o perfil)
  users.js          → lista/cria/troca senha/cargo/exclui usuários (exige login)
  profile.js        → o próprio usuário troca seu nome de exibição e foto
  bau.js            → carrega/salva o Baú (estoque) de cada usuário
  import-bau-image.js → recebe um print, manda pra IA de visão e devolve os itens detectados

lib/
  db.js             → conexão com o Postgres da Neon
  auth.js           → geração/checagem do cookie de sessão (JWT)
  vision.js         → adaptador de IA de visão (Gemini) — troque só aqui se mudar de provedor

scripts/
  create-user.js    → ÚNICO jeito de criar/trocar senha de um usuário

sql/
  schema.sql        → cria a tabela "users" no banco
```

## Como funciona o login

- Não existe cadastro público. Não existe tela de "criar conta" acessível
  sem login. Usuários só podem ser criados por quem **já está logado**,
  de dois jeitos:
  - pela própria aba **Usuários**, dentro de `admin.html` (lista, cria,
    troca senha e exclui usuários); ou
  - rodando `scripts/create-user.js` na sua máquina (útil pra criar o
    primeiro usuário, antes de existir qualquer login).
- As senhas nunca ficam em texto puro: são guardadas com hash `bcrypt`.
- Ao logar, o servidor cria um cookie de sessão `httpOnly` (o navegador não
  consegue ler/alterar via JavaScript), assinado com `JWT_SECRET`, válido
  por 7 dias.
- Todo carregamento de `index.html` e `admin.html` chama `/api/me` (via
  `auth-guard.js`); se não houver sessão válida, redireciona para
  `login.html`.
- A aba Usuários não deixa você excluir o seu próprio login nem apagar o
  último usuário do sistema, pra evitar ficar trancado pra fora.
- Cada usuário tem uma página **Perfil** (no menu lateral, e clicando no
  próprio nome no rodapé da sidebar) onde pode trocar o nome de exibição e
  a foto — fica salvo no banco, então continua igual mesmo fechando o
  navegador ou trocando de aparelho.
- O **cargo** (ex: "Administrador", "Mecânico") só é definido pelo admin,
  na aba Usuários de `admin.html` — de propósito, pra ninguém conseguir se
  auto-promover.
- O **Baú é por usuário**: cada login tem o próprio estoque, guardado no
  Neon (coluna `bau_data`). Adicionar/editar/remover item, e descontar
  material ao forjar, tudo é salvo automaticamente e continua lá mesmo
  fechando o navegador ou trocando de aparelho. Peças e Moldes CNC
  continuam sendo catálogo fixo (igual pra todo mundo) — só as imagens
  deles são compartilhadas via GitHub, como já era antes.

## Passo a passo — configurar o banco (Neon)

1. Crie uma conta grátis em [neon.tech](https://neon.tech) e um novo projeto.
2. No painel do projeto, clique em **Connect** e copie a **connection
   string** (algo como `postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require`).
3. Abra o **SQL Editor** da Neon e rode o conteúdo do arquivo
   `sql/schema.sql` (cria a tabela `users`, com as colunas de perfil:
   `display_name`, `avatar_data` e `role`).

> **Já tinha criado o banco antes?** Se você já rodou `schema.sql` numa
> versão anterior (só com `username`/`password_hash`), rode ele de novo —
> os `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` são seguros e só adicionam
> o que está faltando, sem apagar nada.

## Passo a passo — rodar/criar usuários localmente

1. Instale o [Node.js](https://nodejs.org) (versão 18 ou mais nova).
2. Na pasta do projeto:
   ```bash
   npm install
   cp .env.example .env
   ```
3. Edite o `.env` e cole a `DATABASE_URL` da Neon. Gere um `JWT_SECRET`
   aleatório, por exemplo com `openssl rand -base64 48`.
4. Crie o seu (único) usuário admin:
   ```bash
   node scripts/create-user.js admin "SuaSenhaForte123!"
   ```
   Rode esse mesmo comando de novo, com uma senha nova, sempre que quiser
   trocar a senha. Pode criar mais de um usuário se quiser, repetindo o
   comando com outro nome.

## Publicar (deploy) — Vercel

1. Suba este projeto para um repositório no GitHub (o `.gitignore` já
   impede o `.env` de ir junto).
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e
   importe esse repositório. A Vercel detecta sozinha a pasta `api/` como
   funções de servidor e o resto como site estático.
3. Em **Settings → Environment Variables**, adicione:
   - `DATABASE_URL` → a connection string da Neon
   - `JWT_SECRET` → a mesma string aleatória que você usou no `.env`
   - `NODE_ENV` → `production`
   - `GEMINI_API_KEY` → opcional, só se quiser a importação do Baú por
     imagem (veja a seção **Importação do Baú por imagem (IA)** abaixo)
4. Clique em **Deploy**. Pronto — o site vai estar em algo como
   `https://seu-projeto.vercel.app/login.html`.

## Importação do Baú por imagem (IA)

O Baú tem um botão **"Importar por imagem"**: o usuário envia um print do
inventário do jogo, uma IA de visão computacional lê os itens e quantidades,
e mostra uma tela de revisão antes de qualquer coisa ser salva.

### Por que Gemini (Google AI Studio)

Pesquisei as alternativas realistas pra visão computacional sem custo e sem
depender de servidor próprio com GPU (o que a Vercel não oferece):

| Opção | Gratuito de verdade? | Cartão de crédito? | Qualidade em leitura de ícones/texto de UI |
|---|---|---|---|
| **Gemini 2.0 Flash (Google AI Studio)** | Sim — 1.500 requisições/dia | Não | Boa — é treinado pra OCR + reconhecimento visual, e devolve JSON estruturado nativamente |
| OpenAI GPT-4o / GPT-4.1 Vision | Não — cobra por uso desde o primeiro request | Sim | Ótima, mas fora do requisito de custo zero |
| Groq (Llama Vision) | Parcial — free tier bem mais apertado (~1.000 req/dia por modelo, TPM baixo) | Não | Razoável, mas menos confiável em texto pequeno |
| Modelo local (LLaVA/Moondream via Ollama) | Sim, mas precisa de servidor próprio com GPU/CPU decente rodando 24/7 | Não seria de API, mas tem custo de hospedagem | Fica bem abaixo dos modelos acima em texto pequeno/ícones — pouco viável rodando "de graça" numa função serverless da Vercel, que não tem GPU e teria timeout |

**Gemini 2.0 Flash** venceu porque: (1) é genuinamente gratuito, sem cartão
e sem cobrança surpresa; (2) suporta `responseSchema` — ou seja, dá pra
**forçar** a IA a devolver exatamente o JSON que o sistema espera, em vez de
tentar interpretar texto solto; (3) roda bem dentro de uma função serverless
comum (sem precisar de servidor com GPU); (4) tem qualidade de OCR/visão
muito acima do que dá pra rodar de graça localmente.

### Como a leitura funciona

A IA prioriza o **rótulo de texto** de cada slot (o nome escrito embaixo do
ícone) sobre a aparência do ícone em si — e lê a quantidade a partir do
**multiplicador de pilha** ("2x", "12x", "956x"), nunca do peso mostrado no
slot (ex: "200g", "1.5kg" é ignorado como quantidade).

**Importante: a imagem é sempre a fonte da verdade.** A importação
**substitui** a quantidade do item no site pelo valor lido na imagem — ela
não soma. Ex: se "Cobre" está com 200 no site e a imagem mostra 750, depois
de importar o site fica com exatamente 750 (não 950). Isso é intencional:
o print representa o estado atual do baú no jogo naquele momento.

- **Item já existe no Baú do site** → a quantidade é **substituída** pela
  lida na imagem.
- **Item não existe no Baú do site** → a tela de revisão mostra um selo
  "Novo item" e ele só é criado se o usuário deixar selecionado e confirmar
  — nada é adicionado sem essa confirmação explícita.

### Limitações e como o sistema já minimiza cada uma

- **Limite de 1.500 requisições grátis por dia** (por projeto do Google
  Cloud) — dá bastante folga pro uso de uma oficina, mas se você tiver
  muitos usuários importando ao mesmo tempo, pode bater o limite. O
  endpoint já devolve um erro claro (`429`, "IA sobrecarregada") em vez de
  travar, e o usuário pode tentar de novo depois.
- **Erros de leitura em ícones pequenos, cortados ou muito parecidos entre
  si** — por isso a IA retorna um `confidence` (0 a 1) pra cada item, e a
  tela de revisão **destaca em vermelho** e marca como **"Revisar"**
  qualquer item com confiança abaixo de 60%. Nada é salvo sem o usuário
  confirmar (ou corrigir) cada linha.
- **Nomes que a IA lê ligeiramente diferente do item já cadastrado** (ex:
  "Barra de Cobre" vs "barra cobre") — o sistema compara os nomes
  ignorando maiúsculas/acentos/espaços extras antes de decidir se é um
  item existente (substitui a quantidade) ou um item novo (cria, com
  confirmação). Se a IA errar o nome, o usuário pode corrigir o campo na
  hora, antes de importar — o sistema atualiza a comparação (e o texto
  "vai substituir" / "novo item") em tempo real.
- **Google pode usar prompts do plano gratuito pra treinar modelos** — se
  isso for uma preocupação (dados sensíveis do jogo, por exemplo, não é o
  caso de um inventário fictício), o plano pago da mesma API remove esse
  uso, sem mudar nada no código.

### Arquitetura pensada pra trocar de IA no futuro

Toda a integração com o Gemini fica isolada em um único arquivo:
**`lib/vision.js`**, numa única função: `analyzeInventoryImage({ base64,
mimeType })`. Ela sempre devolve o mesmo formato, não importa o provedor:

```json
{ "items": [ { "name": "Barra de Cobre", "quantity": 12, "confidence": 0.94, "position": "linha 2, coluna 3" } ] }
```

Se um dia quiser trocar de provedor (outro modelo gratuito, GPT-4o Vision
pago, um modelo local via Ollama, etc.), **só precisa reescrever essa
função** — o endpoint (`api/import-bau-image.js`), a tela de revisão e a
lógica de importar no Baú não sabem (nem precisam saber) qual IA está por
trás. É só manter o mesmo formato de retorno.

### Como habilitar

1. Crie uma chave gratuita em
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (conta
   Google, sem cartão de crédito).
2. Cole essa chave na variável `GEMINI_API_KEY` — no seu `.env` local
   (pra testar) e nas variáveis de ambiente da Vercel (pra valer no site
   publicado).
3. Pronto. Se você não configurar essa chave, o resto do site continua
   funcionando normalmente — só o botão "Importar por imagem" mostra um
   aviso pedindo pra configurar.

## Rodar tudo localmente com backend (opcional)

Para testar o login na sua máquina antes de publicar, instale a Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

Isso sobe o site + as funções de `api/` juntos em `http://localhost:3000`.
Abrir só com `python3 -m http.server` **não funciona** para o login, porque
aí não existe backend rodando — só serve para olhar o layout estático.

## Trocar/adicionar usuários depois de publicado

Rode `node scripts/create-user.js <usuario> <senha>` na sua máquina sempre
que precisar — ele conecta direto no banco da Neon usando a `DATABASE_URL`
do seu `.env` local. Não é preciso reimplantar o site.
