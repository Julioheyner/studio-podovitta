# Studio PodoVitta

Site institucional da clínica de podologia Studio PodoVitta, da Podóloga Camila Andrade (São Paulo – SP). É um site estático, feito só com HTML, CSS e JavaScript, sem frameworks nem passo de compilação.

## Estrutura do projeto

```
.
├── index.html          # Estrutura e conteúdo da página
├── css/
│   └── style.css       # Todos os estilos (variáveis, layout, componentes, responsivo)
├── js/
│   └── script.js       # Toda a interatividade
├── img/                # Imagens (hero, sobre, galeria, profissional)
├── video/              # Vídeos usados na secção de vídeos
└── README.md
```

> As pastas `img/` e `video/` não estão incluídas neste pacote. Têm de existir ao lado do `index.html` com os mesmos nomes de ficheiro que o HTML referencia.

## Secções da página

| Âncora | Conteúdo |
| --- | --- |
| `#home` | Hero com chamada para agendamento |
| `#servicos` | Tratamento de unhas, podologia estética, infantil, geriátrica, palmilhas e curativos |
| `#sobre` | Apresentação da profissional e da clínica |
| `#galeria` | Galeria de imagens com lightbox |
| `#videos` | Vídeos de atendimento |
| `#beneficios` | Benefícios e números (contadores animados) |
| `#depoimentos` | Depoimentos de clientes em carrossel |
| `#blog` | Artigos do blog |
| `#agendamento` | Agendamento via WhatsApp |
| `#localizacao` | Mapa incorporado e contactos |

## Funcionalidades (JavaScript)

- Cabeçalho que muda de estilo ao fazer scroll
- Menu mobile (hambúrguer) com ajuste a rotação de ecrã
- Animações de entrada ao fazer scroll (`IntersectionObserver`, com alternativa para navegadores antigos)
- Lightbox da galeria e reprodução dos vídeos
- Contadores animados (respeitam `prefers-reduced-motion`)
- Carrosséis com indicadores
- Artigos do blog com botão que abre o WhatsApp com mensagem pré-preenchida
- Janelas de Política de Privacidade e Termos
- Destaque do link ativo no menu conforme a secção visível
- Botão "voltar ao topo", que se reposiciona ao chegar ao rodapé

## Tecnologias e dependências externas

Carregadas por CDN, por isso é preciso ligação à internet:

- [Font Awesome 6.5.1](https://fontawesome.com/) (ícones)
- [Google Fonts](https://fonts.google.com/): Mulish e Fraunces
- Google Maps (iframe incorporado na secção de localização)
- [randomuser.me](https://randomuser.me) (fotos placeholder dos depoimentos)

## Como executar

Não precisa de instalação. Há duas formas:

1. **Direto no navegador:** abra o `index.html`.
2. **Servidor local (recomendado):** o HTML usa caminhos absolutos como `/img/...` e `/video/...`, que só resolvem corretamente quando o site é servido a partir da raiz. Na pasta do projeto:

   ```bash
   # Python
   python3 -m http.server 8000

   # ou Node
   npx serve .
   ```

   Depois abra `http://localhost:8000`.

## Personalização

- **Cores e tema:** variáveis CSS no bloco `:root` do início de `css/style.css` (por exemplo `--theme`, `--theme-dark`, `--black`).
- **Número de WhatsApp:** os links `wa.me` estão em `index.html` e em `js/script.js` (botões do blog). Faça uma pesquisa global pelo número atual e substitua.
- **Contactos e morada:** secção `#localizacao` e rodapé do `index.html`, incluindo o URL do iframe do Google Maps.
- **SEO:** `<title>`, `description` e as tags `og:*` no `<head>` do `index.html`.
- **Imagens:** substitua os ficheiros em `img/` mantendo os nomes, ou atualize os caminhos no HTML.

## Notas

- Os depoimentos usam fotos de placeholder do randomuser.me. Troque-as por fotos reais (com autorização) ou por avatares próprios antes de publicar.
- Algumas imagens exigem atribuição (Pexels e Pixabay). Os créditos já estão no HTML e devem ser mantidos.
- Os números de telefone e WhatsApp presentes são de demonstração. Confirme todos os contactos antes da publicação.

## Publicação

Por ser estático, pode ser publicado em qualquer alojamento: GitHub Pages, Netlify, Vercel, Cloudflare Pages ou um servidor tradicional. Basta enviar a pasta inteira (`index.html`, `css/`, `js/`, `img/`, `video/`).

### OBSERVAÇÃO ###
### Projeto de Site Fictício para aprimorar meus conhecimentos em desenvolvimento ###
