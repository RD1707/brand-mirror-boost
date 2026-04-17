import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Step = "identificacao" | "endereco" | "pagamento";

const steps: { key: Step; label: string }[] = [
  { key: "identificacao", label: "Identificação" },
  { key: "endereco", label: "Endereço" },
  { key: "pagamento", label: "Pagamento" },
];

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [loading, setLoading] = useState(false);
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Identificação
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  // Endereço
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  const handleFinalize = async () => {
    if (items.length === 0) {
      toast({ title: "Carrinho vazio", variant: "destructive" });
      return;
    }
    setLoading(true);

    // 1) Cria o pedido como 'pending' no banco
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "pending",
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone,
        buyer_cpf: cpf,
        shipping_address: { cep, street, number, complement, neighborhood, city, state },
        subtotal,
        shipping: 0,
        total: subtotal,
      })
      .select()
      .single();

    if (orderErr || !order) {
      setLoading(false);
      toast({ title: "Erro ao criar pedido", description: orderErr?.message, variant: "destructive" });
      return;
    }

    // 2) Insere os itens do pedido
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((it) => ({
        order_id: order.id,
        product_id: it.product.id,
        product_name: it.product.name,
        product_image: it.product.image_url,
        unit_price: it.product.price,
        quantity: it.quantity,
      }))
    );

    if (itemsErr) {
      setLoading(false);
      toast({ title: "Erro ao salvar itens", description: itemsErr.message, variant: "destructive" });
      return;
    }

    // 3) Chama edge function para criar Stripe Checkout Session
    const { data: checkout, error: fnErr } = await supabase.functions.invoke("create-checkout", {
      body: { order_id: order.id },
    });

    setLoading(false);

    if (fnErr || !checkout?.url) {
      toast({
        title: "Stripe não configurado ainda",
        description: "Pedido salvo no banco. Configure as edge functions e a STRIPE_SECRET_KEY para concluir.",
      });
      clearCart();
      navigate("/minha-conta");
      return;
    }

    clearCart();
    window.location.href = checkout.url;
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
                  <div><label className="text-sm text-muted-foreground block mb-1">Nome completo</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">E-mail</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">CPF</label><Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Telefone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" /></div>
                </div>
                <Button onClick={() => setCurrentStep("endereco")} disabled={!name || !email} className="w-full rounded-lg">Continuar</Button>
              </div>
            )}

            {currentStep === "endereco" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Endereço de entrega</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground block mb-1">CEP</label><Input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" /></div>
                  <div className="sm:col-span-2"><label className="text-sm text-muted-foreground block mb-1">Rua</label><Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Nome da rua" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Número</label><Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Complemento</label><Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco..." /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Bairro</label><Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Cidade</label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Estado</label><Input value={state} onChange={(e) => setState(e.target.value)} placeholder="UF" /></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep("identificacao")} className="flex-1 rounded-lg">Voltar</Button>
                  <Button onClick={() => setCurrentStep("pagamento")} disabled={!cep || !street || !number || !city} className="flex-1 rounded-lg">Continuar</Button>
                </div>
              </div>
            )}

            {currentStep === "pagamento" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Pagamento</h2>
                <div className="border border-primary bg-primary/5 rounded-lg p-4 flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Pagamento seguro com Stripe</p>
                    <p className="text-muted-foreground text-xs">
                      Você será redirecionado para a página segura da Stripe para inserir os dados do cartão. Por motivos de segurança e
                      conformidade PCI-DSS, nunca armazenamos o número completo do seu cartão. Apenas os últimos 4 dígitos e a bandeira
                      ficam registrados após o pagamento.
                    </p>
                  </div>
                </div>

                <div className="text-sm bg-muted/50 rounded-lg p-4">
                  <p className="font-medium mb-2">Resumo da compra</p>
                  <p className="text-muted-foreground">Comprador: {name}</p>
                  <p className="text-muted-foreground">E-mail: {email}</p>
                  <p className="text-muted-foreground">Entrega: {street}, {number} - {city}/{state}</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep("endereco")} className="flex-1 rounded-lg">Voltar</Button>
                  <Button onClick={handleFinalize} disabled={loading} className="flex-1 rounded-lg">
                    {loading ? "Processando..." : "Pagar com Stripe"}
                  </Button>
                </div>
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
