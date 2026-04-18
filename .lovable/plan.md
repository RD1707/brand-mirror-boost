

# Plano: Páginas internas + navegação clicável + responsividade

## O que está quebrado hoje
Olhando o `Header.tsx` e `TopBar.tsx`, todos os links de categorias (Lançamentos, Promos, Outlet, Perfumaria, Corpo e Banho, Make, Cabelos, Skincare, Infantil, Masculino) e os links da barra superior (Acessibilidade, Grupo Boticário, Precisa de ajuda?, Portal do Revendedor, Quero Revender, Meus Pedidos, Favoritos, Dúvidas do footer, etc.) são `<a href="#">` — não levam a lugar nenhum.

## Solução

### 1. Criar página genérica de Categoria
Uma única página `src/pages/Category.tsx` que recebe o slug pela URL (`/categoria/:slug`) e:
- Busca produtos do Supabase filtrando por `category.slug`
- Mostra título da categoria + grid de produtos (reusa estilo do `ProductGrid`)
- Inclui breadcrumb, contador de resultados, estado vazio
- Para slugs especiais (`lancamentos`, `promos`, `outlet`) filtra por badge/desconto em vez de categoria

### 2. Criar páginas institucionais
Template único e leve `src/components/InfoPage.tsx` (Layout + título + conteúdo) reaproveitado por:
- `/acessibilidade` — Acessibilidade
- `/grupo-boticario` — Grupo Boticário
- `/ajuda` — Precisa de ajuda? (FAQ)
- `/revendedor` — Portal do Revendedor
- `/quero-revender` — Quero Revender
- `/favoritos` — Favoritos (placeholder com CTA pra logar)
- `/duvidas/:topic` — para os links do footer (Perguntas Frequentes, Pagamento, Frete, Trocas, Mapa do Site, Política de Privacidade, Termos, Cookies, etc.)

Cada página usa Layout (Header + Footer) e tem conteúdo placeholder editorial pertinente — você ajusta o texto depois.

### 3. Tornar tudo clicável
- `Header.tsx`: trocar `<a href="#">` por `<Link to="/categoria/{slug}">` para cada item do menu principal
- `TopBar.tsx`: links da barra superior viram `<Link>` para as rotas institucionais
- `Footer.tsx`: links das colunas (Dúvidas, Marcas, Responsabilidade, Links úteis) viram `<Link>` apropriados
- "Meus Pedidos" → `/minha-conta`
- Logo do header → `/`

### 4. Responsividade
- Header: revisar menu mobile (drawer já existe?). Garantir que categorias aparecem no menu hamburguer em telas <md
- TopBar: já oculta em mobile com `hidden md:block` — manter
- Category/Info pages: container com padding responsivo, grid `1 → 2 → 3 → 4 colunas` conforme breakpoint
- Footer: já é grid responsivo, validar em <640px

### 5. Rotas a adicionar em `App.tsx`
```text
/categoria/:slug      → Category
/acessibilidade       → InfoPage(Acessibilidade)
/grupo-boticario      → InfoPage(Grupo Boticário)
/ajuda                → InfoPage(Ajuda/FAQ)
/revendedor           → InfoPage(Revendedor)
/quero-revender       → InfoPage(Quero Revender)
/favoritos            → Favoritos (placeholder)
/info/:topic          → InfoPage dinâmica para itens do footer
```

## Arquivos

**Novos:**
- `src/pages/Category.tsx`
- `src/pages/Favoritos.tsx`
- `src/components/InfoPage.tsx` (template reutilizável)
- `src/data/infoPages.ts` (textos placeholder por slug)

**Editados:**
- `src/App.tsx` — novas rotas
- `src/components/Header.tsx` — Links + revisão mobile
- `src/components/TopBar.tsx` — Links
- `src/components/Footer.tsx` — Links

## Observação sobre erros pendentes
Os bugs do `Checkout.tsx`, `create-checkout` e `AdminOrders` que você mencionou antes ficam de fora deste escopo (foco aqui é navegação + páginas). Se quiser, depois desse passo eu abro um plano só pra eles — sem captura de dados sensíveis de cartão (não posso implementar isso, mesmo em contexto educacional, pois o número/CVV não pode ser armazenado).

