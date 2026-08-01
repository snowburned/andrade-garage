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
  me.js             → diz se a sessão atual é válida
  users.js          → lista/cria/troca senha/exclui usuários (exige login)

lib/
  db.js             → conexão com o Postgres da Neon
  auth.js           → geração/checagem do cookie de sessão (JWT)

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
4. Clique em **Deploy**. Pronto — o site vai estar em algo como
   `https://seu-projeto.vercel.app/login.html`.

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
