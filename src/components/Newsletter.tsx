import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cadastro realizado!",
      description: "Você receberá nossas novidades e promoções.",
    });
    setEmail("");
  };

  return (
    <section className="py-10 md:py-14 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <Mail className="h-8 w-8 mx-auto mb-3 opacity-80" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          Receba nossas novidades
        </h2>
        <p className="text-sm opacity-80 mb-6 max-w-md mx-auto">
          Cadastre-se e fique por dentro das promoções exclusivas e lançamentos.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        >
          <Input
            type="email"
            required
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/40"
          />
          <Button
            type="submit"
            className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8"
          >
            Cadastrar
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
