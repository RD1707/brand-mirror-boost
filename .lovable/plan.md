

# Plano final: Backend Supabase clássico + Admin + Stripe

## Decisões confirmadas
- **~25 produtos fictícios** (perfumaria/corpo/maquiagem/cabelos) com Unsplash — você troca pelo painel
- **Supabase clássico** (você conecta seu projeto e cola o SQL no editor)
- **Stripe BYOK** (sua conta, sua secret key)
- **Coleta prévia de dados** antes do Stripe: nome, email, endereço, telefone gravados no nosso banco
- **Dados do cartão:** apenas o que é seguro/legal — últimos 4, bandeira, status, valor, horário, ID Stripe (vêm do webhook após o pagamento)

## ⚠️ Importante sobre o cartão
Mesmo que o cliente "digite no nosso site", o número completo + CVV **nunca** podem ser salvos no banco (PCI-DSS). O fluxo correto e seguro:
1. Cliente preenche **nome, email, endereço** no nosso checkout → salvamos no banco como pedido `pending`
2. Cliente clica "Pagar" → vai pro **Stripe Checkout** (Stripe coleta o cartão de forma compliant)
3. Webhook da Stripe nos devolve: últimos 4, bandeira, status, payment_intent_id → salvamos no nosso pedido

## 1. Arquivo `database.sql` (raiz do projeto)
Schema completo pronto pra colar no SQL Editor do Supabase:
- Enum `app_role`
- Tabelas: `categories`, `products`, `profiles`, `user_roles`, `orders`, `order_items`
- Função `has_role()` SECURITY DEFINER
- Trigger `handle_new_user` (cria profile no signup)
- RLS em todas as tabelas (produtos público leitura / admin escreve; orders dono ou admin)
- Bucket `product-images` (público leitura, admin escreve)
- Seed de ~25 produtos + 4 categorias
- Comentário no final ensinando como virar admin manualmente

Campos de `orders` (dados do comprador + pagamento seguros):
`buyer_name, buyer_email, buyer_phone, shipping_address (jsonb), subtotal, shipping, total, status, stripe_session_id, stripe_payment_intent, card_last4, card_brand, paid_at, created_at`

## 2. Conexão Supabase
- Instalar `@supabase/supabase-js`
- `src/integrations/supabase/client.ts` lendo `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Vou pedir as duas chaves quando chegar a hora (você cria projeto e me passa)
- Hook `useAuth` (sessão + onAuthStateChange) e `useAdmin` (checa role)

## 3. Frontend integrado ao banco
- `Index`, `ProductDetail`, `BrandHighlights` puxam produtos via React Query
- `Login.tsx` → Supabase Auth real (signup/signin)
- `MyAccount.tsx` → pedidos reais do usuário
- `Checkout.tsx` → coleta nome/email/telefone/endereço, cria pedido `pending`, chama edge function de checkout

## 4. Painel Admin (`/admin`)
Protegido por role `admin`:
- **Produtos:** CRUD completo + upload de imagem pro Storage + toggle ativo/estoque
- **Pedidos:** lista com filtro por status; modal de detalhes mostrando itens, comprador, endereço, últimos 4 dígitos, bandeira, link pra transação Stripe
- **Categorias:** CRUD básico

## 5. Stripe (Edge Functions Supabase)
- **`create-checkout`** — recebe order_id, busca pedido, cria Stripe Checkout Session com line_items, retorna URL
- **`stripe-webhook`** — escuta `checkout.session.completed`, atualiza pedido pra `paid` com last4/brand/payment_intent/paid_at
- Páginas `/checkout/success` e `/checkout/cancel`
- Secrets necessárias: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (peço quando for fazer deploy)

## 6. Fluxo do cliente (resumo visual)
```text
Carrinho → Checkout (preenche dados) → Pedido criado (pending) no Supabase
   → Redirect Stripe Checkout → Cliente paga
   → Webhook atualiza pedido (paid + last4 + brand)
   → /checkout/success
Admin vê tudo em /admin/pedidos
```

## 7. Como você vai usar
1. Aprovar este plano
2. Criar projeto Supabase → me passar URL + anon key
3. Copiar `database.sql` e rodar no SQL Editor
4. Cadastrar-se no site e rodar no SQL Editor:
   `INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email='seu@email.com';`
5. Criar conta Stripe → me passar `STRIPE_SECRET_KEY`
6. Deploy das edge functions (Supabase CLI ou dashboard) → configurar webhook na Stripe → me passar `STRIPE_WEBHOOK_SECRET`

## 8. Arquivos
**Novos:** `database.sql`, `src/integrations/supabase/{client,types}.ts`, `src/hooks/{useAuth,useAdmin}.tsx`, `src/pages/Admin.tsx`, `src/pages/admin/{Products,Orders,Categories}.tsx`, `src/pages/{CheckoutSuccess,CheckoutCancel}.tsx`, `src/components/admin/{ProductForm,OrderDetailModal,AdminLayout}.tsx`, `supabase/functions/create-checkout/index.ts`, `supabase/functions/stripe-webhook/index.ts`

**Editados:** `App.tsx`, `Index.tsx`, `ProductDetail.tsx`, `Login.tsx`, `MyAccount.tsx`, `Checkout.tsx`, `Header.tsx`, `CartContext.tsx`, `package.json`

