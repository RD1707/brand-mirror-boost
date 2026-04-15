

# Plano: Fonte correta + Imagens/textos reais + Páginas internas completas

## 1. Fonte do Boticário
O site boticario.com.br usa **"Boticario Sans"** (fonte proprietária) com fallback para **"Noto Sans", sans-serif**. Como a fonte proprietária não é pública, usaremos **"Noto Sans"** do Google Fonts (visualmente muito próxima). Trocar a atual "Lato" por "Noto Sans" em `index.css`.

## 2. Imagens e textos reais do Boticário
Atualizar `src/data/products.ts`, `banners.ts`, `categories.ts` com:
- Imagens reais dos produtos via CDN do Boticário (ex: `https://res.cloudinary.com/beleza-na-web/image/upload/...` ou URLs do próprio site)
- Nomes, preços e descrições reais dos produtos
- Expandir o `Product` interface com campos: `description`, `rating`, `reviewCount`, `images[]`, `category`, `slug`

## 3. Novas Páginas a Criar

### 3.1 Página de Produto (`/produto/:slug`)
- Galeria de imagens com thumbnails
- Nome, linha, avaliações com estrelas
- Preço (original riscado + atual), parcelamento
- Seletor de quantidade
- Botões "Adicionar à sacola" e "Comprar agora"
- Descrição, ingredientes, modo de uso em abas/accordion
- Seção "Produtos relacionados"

### 3.2 Carrinho (`/carrinho`)
- Lista de itens com imagem, nome, preço, quantidade editável
- Botão remover item
- Resumo: subtotal, frete, total
- Campo de CEP para calcular frete
- Campo de cupom de desconto
- Botão "Finalizar compra"

### 3.3 Checkout (`/checkout`)
- Steps: Identificação → Endereço → Pagamento → Confirmação
- Formulário de dados pessoais (nome, CPF, telefone)
- Formulário de endereço (CEP, rua, número, bairro, cidade, estado)
- Seleção de forma de pagamento (cartão, Pix, boleto)
- Resumo do pedido lateral
- Botão "Finalizar pedido"

### 3.4 Login/Cadastro (`/login`)
- Abas "Entrar" e "Criar conta"
- Login: email + senha + "Esqueci minha senha"
- Cadastro: nome, email, CPF, telefone, senha
- Estética com fundo verde Boticário

### 3.5 Minha Conta (`/minha-conta`)
- Menu lateral: Meus Dados, Pedidos, Endereços, Favoritos
- Listagem de pedidos com status
- Edição de dados pessoais

## 4. Carrinho Global (Context API)
- `CartContext` com `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- Badge no ícone da sacola no Header mostrando quantidade
- Persistência em `localStorage`

## 5. Layout compartilhado
- Criar `Layout.tsx` com TopBar + Header + children + Footer
- Usar em todas as páginas para consistência

## 6. Arquivos a criar/editar

| Ação | Arquivo |
|------|---------|
| Editar | `src/index.css` — Noto Sans |
| Editar | `src/data/products.ts` — dados reais, campos extras, slug |
| Editar | `src/data/banners.ts` — imagens e textos reais |
| Editar | `src/data/categories.ts` — imagens reais |
| Criar | `src/contexts/CartContext.tsx` |
| Criar | `src/components/Layout.tsx` |
| Criar | `src/pages/ProductDetail.tsx` |
| Criar | `src/pages/Cart.tsx` |
| Criar | `src/pages/Checkout.tsx` |
| Criar | `src/pages/Login.tsx` |
| Criar | `src/pages/MyAccount.tsx` |
| Editar | `src/App.tsx` — rotas novas |
| Editar | `src/components/Header.tsx` — links para /login, /carrinho com badge |
| Editar | `src/components/ProductGrid.tsx` — link para /produto/:slug |
| Editar | `src/components/BrandHighlights.tsx` — link para /produto/:slug |

## Detalhes Técnicos
- Todas as páginas são estáticas (sem backend), dados mockados
- Checkout simula finalização com toast de confirmação
- Login é visual apenas (sem autenticação real)
- Carrinho funciona com Context API + localStorage
- Navegação via `react-router-dom` `Link` e `useNavigate`

