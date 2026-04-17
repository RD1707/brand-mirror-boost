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

// Imports oficiais da Stripe
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Carrega a chave do .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_sua_chave_aqui");

type Step = "identificacao" | "endereco" | "pagamento";
const steps: { key: Step; label: string }[] = [
  { key: "identificacao", label: "Identificação" },
  { key: "endereco", label: "Endereço" },
  { key: "pagamento", label: "Pagamento" },
];

// --- Sub-componente: O Formulário do Cartão ---
const StripePaymentForm = ({ orderId }: { orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order_id=${orderId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "Ocorreu um erro no pagamento.");
      setIsProcessing(false);
    } else {
      clearCart();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && <div className="text-red-500 text-sm font-medium">{errorMessage}</div>}
      <Button disabled={!stripe || isProcessing} className="w-full rounded-lg text-lg h-12">
        {isProcessing ? "Processando..." : "Confirmar Pagamento"}
      </Button>
    </form>
  );
};
// ----------------------------------------------

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [loading, setLoading] = useState(false);
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

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

  // O segredo do pagamento gerado pelo backend
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  const preparePayment = async () => {
    if (items.length === 0) return toast({ title: "Carrinho vazio", variant: "destructive" });
    setLoading(true);

    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: user?.id ?? null, status: "pending", buyer_name: name, buyer_email: email,
      buyer_phone: phone, buyer_cpf: cpf, shipping_address: { cep, street, number, complement, neighborhood, city, state },
      subtotal, shipping: 0, total: subtotal,
    }).select().single();

    if (orderErr || !order) {
      setLoading(false);
      return toast({ title: "Erro ao criar pedido", variant: "destructive" });
    }

    await supabase.from("order_items").insert(items.map((it) => ({
      order_id: order.id, product_id: it.product.id, product_name: it.product.name,
      product_image: it.product.image_url, unit_price: it.product.price, quantity: it.quantity,
    })));

    // Chama a Edge Function para buscar o Client Secret
    const { data: intentData, error: fnErr } = await supabase.functions.invoke("create-checkout", {
      body: { order_id: order.id },
    });

    setLoading(false);

    if (fnErr || !intentData?.clientSecret) {
      return toast({ title: "Erro na conexão segura", variant: "destructive" });
    }

    setClientSecret(intentData.clientSecret);
    setOrderId(order.id);
    setCurrentStep("pagamento");
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
                  <div><label className="text-sm text-muted-foreground block mb-1">Nome completo</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">E-mail</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">CPF</label><Input value={cpf} onChange={(e) => setCpf(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Telefone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                </div>
                <Button onClick={() => setCurrentStep("endereco")} disabled={!name || !email} className="w-full rounded-lg">Continuar</Button>
              </div>
            )}

            {currentStep === "endereco" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Endereço de entrega</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground block mb-1">CEP</label><Input value={cep} onChange={(e) => setCep(e.target.value)} /></div>
                  <div className="sm:col-span-2"><label className="text-sm text-muted-foreground block mb-1">Rua</label><Input value={street} onChange={(e) => setStreet(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Número</label><Input value={number} onChange={(e) => setNumber(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Complemento</label><Input value={complement} onChange={(e) => setComplement(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Bairro</label><Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Cidade</label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Estado</label><Input value={state} onChange={(e) => setState(e.target.value)} /></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep("identificacao")} className="flex-1 rounded-lg">Voltar</Button>
                  <Button onClick={preparePayment} disabled={!cep || !street || !number || !city || loading} className="flex-1 rounded-lg">
                    {loading ? "Processando..." : "Ir para Pagamento"}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "pagamento" && clientSecret && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold mb-1">Pagamento Seguro</h2>
                  <p className="text-sm text-muted-foreground">Insira os dados do cartão. O processamento é criptografado pela Stripe.</p>
                </div>

                {/* Aqui entra a magia do Stripe Elements! */}
                <div className="border border-border rounded-lg p-4 bg-background">
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm orderId={orderId} />
                  </Elements>
                </div>

                <Button variant="outline" onClick={() => setCurrentStep("endereco")} className="w-full rounded-lg">Voltar</Button>
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