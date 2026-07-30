# ANDRADE GARAGE — Painel Interno

Painel interno de estoque e forjas da ANDRADE GARAGE (Street Car Club RP).

Site estático (HTML + CSS + JS puro, com Tailwind via CDN), sem backend e sem
banco de dados — todos os dados ficam em `data.js`.

## Estrutura

```
index.html   → estrutura da página
style.css    → estilos (tema escuro, roxo, fundo, cards, modais)
script.js    → toda a lógica (navegação, busca, CRUD do Baú, modais)
data.js      → dados do sistema (Baú, Peças, Moldes CNC)
assets/      → imagens (fundo do site, fotos de peças)
```

## Como rodar localmente

Basta abrir o `index.html` no navegador, ou servir a pasta com um servidor
estático simples, por exemplo:

```bash
python3 -m http.server 8080
```

E acessar `http://localhost:8080`.

## Publicar no GitHub Pages (opcional)

Em **Settings → Pages** do repositório, selecione a branch `main` e a pasta
`/ (root)`. O site ficará disponível em
`https://SEU_USUARIO.github.io/andrade-garage/`.
