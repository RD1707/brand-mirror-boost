import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, QrCode, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

type Step = "identificacao" | "endereco" | "pagamento" | "confirmacao";

const steps: { key: Step; label: string }[] = [
  { key: "identificacao", label: "Identificação" },
  { key: "endereco", label: "Endereço" },
  { key: "pagamento", label: "Pagamento" },
  { key: "confirmacao", label: "Confirmação" },
];

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [paymentMethod, setPaymentMethod] = useState<"cartao" | "pix" | "boleto">("cartao");
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  const handleFinalize = () => {
    clearCart();
    toast({ title: "Pedido realizado com sucesso! 🎉", description: "Você receberá um e-mail com os detalhes." });
    navigate("/");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step indicators */}
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
          {/* Form */}
          <div className="lg:col-span-2">
            {currentStep === "identificacao" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Dados pessoais</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground block mb-1">Nome completo</label><Input placeholder="Seu nome" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">E-mail</label><Input type="email" placeholder="email@exemplo.com" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">CPF</label><Input placeholder="000.000.000-00" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Telefone</label><Input placeholder="(00) 00000-0000" /></div>
                </div>
                <Button onClick={() => setCurrentStep("endereco")} className="w-full rounded-lg">Continuar</Button>
              </div>
            )}

            {currentStep === "endereco" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Endereço de entrega</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground block mb-1">CEP</label><Input placeholder="00000-000" /></div>
                  <div className="sm:col-span-2"><label className="text-sm text-muted-foreground block mb-1">Rua</label><Input placeholder="Nome da rua" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Número</label><Input placeholder="123" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Complemento</label><Input placeholder="Apto, bloco..." /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Bairro</label><Input placeholder="Bairro" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Cidade</label><Input placeholder="Cidade" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Estado</label><Input placeholder="UF" /></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep("identificacao")} className="flex-1 rounded-lg">Voltar</Button>
                  <Button onClick={() => setCurrentStep("pagamento")} className="flex-1 rounded-lg">Continuar</Button>
                </div>
              </div>
            )}

            {currentStep === "pagamento" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Forma de pagamento</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {([
                    { key: "cartao" as const, icon: CreditCard, label: "Cartão de Crédito" },
                    { key: "pix" as const, icon: QrCode, label: "Pix" },
                    { key: "boleto" as const, icon: FileText, label: "Boleto" },
                  ]).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setPaymentMethod(m.key)}
                      className={`border rounded-lg p-4 flex flex-col items-center gap-2 transition-colors ${paymentMethod === m.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    >
                      <m.icon className={`h-6 w-6 ${paymentMethod === m.key ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "cartao" && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div><label className="text-sm text-muted-foreground block mb-1">Número do cartão</label><Input placeholder="0000 0000 0000 0000" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-sm text-muted-foreground block mb-1">Validade</label><Input placeholder="MM/AA" /></div>
                      <div><label className="text-sm text-muted-foreground block mb-1">CVV</label><Input placeholder="000" /></div>
                    </div>
                    <div><label className="text-sm text-muted-foreground block mb-1">Nome no cartão</label><Input placeholder="Nome impresso no cartão" /></div>
                  </div>
                )}
                {paymentMethod === "pix" && (
                  <div className="text-center py-6 border-t border-border">
                    <QrCode className="h-32 w-32 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">O QR Code Pix será gerado após a finalização</p>
                  </div>
                )}
                {paymentMethod === "boleto" && (
                  <div className="text-center py-6 border-t border-border">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">O boleto será gerado após a finalização do pedido</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep("endereco")} className="flex-1 rounded-lg">Voltar</Button>
                  <Button onClick={handleFinalize} className="flex-1 rounded-lg">Finalizar pedido</Button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="bg-card border border-border rounded-lg p-6 h-fit">
            <h3 className="font-bold mb-4">Resumo do pedido</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.image} alt="" className="w-12 h-12 rounded object-cover" />
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
