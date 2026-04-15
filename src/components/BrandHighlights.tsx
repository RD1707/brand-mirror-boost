import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { brandHighlightProducts } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const BrandHighlights = () => {
  const formatPrice = (price: number) =>
    price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const { addItem } = useCart();
  const { toast } = useToast();

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3 text-sm px-4 py-1">Destaques</Badge>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Linhas exclusivas para você</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {brandHighlightProducts.map((product) => (
            <div key={product.id} className="bg-background rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow group">
              <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="p-3 md:p-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{product.line}</p>
                <Link to={`/produto/${product.slug}`}>
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem] hover:text-primary">{product.name}</h3>
                </Link>
                <p className="text-lg font-bold text-primary mb-3">{formatPrice(product.price)}</p>
                <Button
                  onClick={() => {
                    addItem(product);
                    toast({ title: "Adicionado!", description: `${product.name} adicionado à sacola.` });
                  }}
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm gap-2"
                >
                  <ShoppingBag className="h-4 w-4" /> Comprar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandHighlights;
