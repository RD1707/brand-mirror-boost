import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Tipos
type Step = "identificacao" | "endereco" | "pagamento";

const steps: { key: Step; label: string }[] = [
  { key: "identificacao", label: "Identificação" },
  { key: "endereco", label: "Endereço" },
  { key: "pagamento", label: "Pagamento" },
];

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Dados do carrinho
  const cartData = useCart();

  // Dados do usuário (para endereço)
  const userFieldsState = {
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",

    setName: (name: string) => { },
    setEmail: (email: string) => { },
    setPhone: (phone: string) => { },
    setCpf: (cpf: string) => { },
    setCep: (cep: string) => { },
    setStreet: (street: string) => { },
    setNumber: (number: number) => { },
    setComplement: (complement: string) => { },
    setNeighborhood: (neighborhood: string) => { },
    setCity: (city: string) => { },
    setState: (state: string) => { },




  };



  // Função para criar pedido no Supabase e obter clientSecret da Stripe
  const prepareOrderAndPaymentIntent = async () => {

    if (!cartData.items.length) {
      toast({ title: "Carrinho vazio", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {

      const response = await fetch("https://seu-dominio.supabase.co/function/capture-payment-intent",
        {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: "12345",
            total: cartData.subtotal,
          }),
        });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setCurrentStep("pagamento");

    } catch (err: any) {
      toast({ title: `Erro ao criar pedido:${err.message}`, variant: 'destructive' });
    }

    finally {
      setLoading(false);
    }
  };

  // Componente de pagamento real com Stripe Elements

  const PaymentForm = () => {

    const stripe = Stripe(
      process.env.STRIPE_PUBLIC_KEY as string, {
      apiVersion: '2024-06-20',
    });

    const elements = useElements(stripe);

    if (!stripe || !elements) return <div>Carregando...</div>;

    return (

      <form id="payment-form">
        <div className="bg-white rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="card-element">
              Cartão de Crédito
            </label>
            <CardElement />
          </div>

          <button id="submit"
            disabled={!stripe || !elements}
            className={`bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:border-orange focus:border-solid w-full`}
          >
            {loading ? "Processando..." : "Pagar"}
          </button>

          <p id="payment-message"></p>
        </div>
      </form>

    );

  };

  return (
    <Layout>
      {currentStep === "identificacao" && (
        <>
          <h2>Dados pessoais</h2>
          <Input value={userFieldsState.name} onChange={(e) => userFieldsState.setName(e.target.value)} required />
          <Input value={userFieldsState.email} onChange={(e) => userFieldsState.setEmail(e.target.value)} type={"email"} required />
          <Input value={userFieldsState.phone} onChange={(e) => userFieldsState.setPhone(e.target.value)} placeholder={"(11)999999999"} required />
          <Button onClick={() => {
            setCurrentStep("endereco");
          }} disabled={!userFieldsState.name || !userFieldsState.email || !userFieldsState.phone}>
            Continuar
          </Button>

        </>

      )}

      {currentStep === "endereco" && (
        <>
          <h2>Endereço de entrega</h2>
          <Input value={userFieldsState.cep} onChange={(e) => userFieldsState.setCep(e.target.value)} placeholder={"00000000"} required />
          <Input value={userFieldsState.street} onChange={(e) => userFieldssate.setStreet(e.target.value)} required />
          <Input value={Number(userFieldssate.number)} onChange={(e) => (Number(userFieldssate.setNumber(Number(e.target.value))))} />
          <Button onClick={() => {
            prepareOrderAndPaymentIntent();
          }}
            disabled={!carUserFieldssate.cep || !carUserFieldssate.street || !carUserFieldssate.number}
          >Ir para Pagamento
          </Button>

        </>

      )}

      {currentStep === "pagamento" && (
<>
          <h2>Pagamento:</h2>
          <PaymentForm />

          {/>}
          {/Layout>)

};