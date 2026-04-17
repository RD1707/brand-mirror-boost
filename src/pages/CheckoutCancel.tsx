import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const CheckoutCancel = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pagamento cancelado</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Você cancelou o pagamento. Seu carrinho continua salvo, é só voltar quando quiser.
        </p>
        <div className="flex flex-col gap-2">
          <Link to="/carrinho"><Button className="w-full rounded-lg">Voltar ao carrinho</Button></Link>
          <Link to="/"><Button variant="outline" className="w-full rounded-lg">Continuar comprando</Button></Link>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutCancel;
