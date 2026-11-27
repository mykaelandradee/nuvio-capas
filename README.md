# Nuvio Studio

Gerador de capas de pasta, logos (PNG com fundo transparente) e fundos de hero para coleções do Nuvio.

- Busca fundos e logos de filmes, séries e sagas no TMDB (com o seu próprio token, salvo só no seu navegador) ou aceita upload de imagem.
- Personalização completa: fontes (inclusive a sua), contorno, sombra, zoom e filtros do fundo, posição da logo, profundidade (texto atrás do assunto).
- Estilos salvos, importação e exportação de estilos.
- Geração de coleções em lote e pacote completo em ZIP.
- Roda 100% no navegador: as imagens não são enviadas a nenhum servidor.
- Site estático: basta publicar o `index.html`.

Ferramenta não oficial, sem vínculo com Nuvio, Xperience ou TMDB.
This product uses the TMDB API but is not endorsed or certified by TMDB.

## Hero de Coleções

O módulo **Hero de Coleções** cria fundos 16:9 com vários títulos relacionados, usando imagens de backdrop do TMDB. Ele funciona separado do editor tradicional e não altera os fluxos existentes.

- Tipos: gênero, ano, streaming no Brasil e lista personalizada.
- Conteúdo: filmes, séries ou ambos.
- Composições: mural inclinado, mosaico e faixas dinâmicas.
- Exportação individual em PNG Full HD ou 4K.
- Geração em lote de todas as categorias disponíveis, com pacote ZIP.
- Prévia, lista de títulos utilizados, progresso e cancelamento do lote.
- A composição é feita no navegador; não há upload das imagens para o servidor.

Para usar, informe o **API Read Access Token** na seção “Buscar no TMDB” e abra “Hero de Coleções” no painel lateral. Para gerar em lote, selecione “Todas as opções deste tipo” e clique em “Gerar lote ZIP”.

As opções de streaming consultam os provedores disponíveis no Brasil no catálogo do TMDB. A disponibilidade e a lista de títulos dependem dos dados retornados pelo TMDB.
