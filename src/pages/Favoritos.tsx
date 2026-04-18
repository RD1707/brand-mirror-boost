import { Link } from "react-router-dom";
import { Heart, Home, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Favoritos = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-3xl">
        <nav className="flex items-center gap-1.5 text-xs text-foreground/60 mb-6">
          <Link to="/" className="flex items-center gap-1 hover:text-primary">
            <Home className="h-3 w-3" /> Início
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Favoritos</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Meus Favoritos</h1>
          <p className="text-sm text-foreground/60">
            Salve seus produtos preferidos para encontrá-los facilmente.
          </p>
        </header>

        <div className="bg-card border border-border rounded-lg p-10 md:p-14 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            {user ? "Você ainda não tem favoritos" : "Faça login para ver seus favoritos"}
          </h2>
          <p className="text-sm text-foreground/60 mb-6 max-w-md mx-auto">
            {user
              ? "Toque no coração nos produtos para salvá-los aqui."
              : "Entre na sua conta para salvar produtos e acessá-los de qualquer dispositivo."}
          </p>
          {user ? (
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explorar produtos
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Entrar na minha conta
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Favoritos;
