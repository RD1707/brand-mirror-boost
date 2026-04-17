import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pagamento confirmado!</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Seu pedido foi recebido e está sendo processado. Você receberá um e-mail com os detalhes.
        </p>
        {orderId && (
          <p className="text-xs text-muted-foreground mb-6">
            Número do pedido: <span className="font-mono">#{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Link to="/minha-conta"><Button className="w-full rounded-lg">Ver meus pedidos</Button></Link>
          <Link to="/"><Button variant="outline" className="w-full rounded-lg">Continuar comprando</Button></Link>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
