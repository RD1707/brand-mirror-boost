import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { featuredProducts, type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductCard = ({ product }: { product: Product }) => {
  const formatPrice = (price: number) =>
    price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast({ title: "Adicionado!", description: `${product.name} foi adicionado à sacola.` });
  };

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/produto/${product.slug}`} className="block relative">
        <img src={product.image} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">{product.badge}</span>
        )}
        <button className="absolute top-2 right-2 p-1.5 bg-card/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
          <Heart className="h-4 w-4 text-foreground" />
        </button>
      </Link>
      <div className="p-3 md:p-4">
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.round(product.rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">({product.reviewCount})</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{product.line}</p>
        <Link to={`/produto/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem] hover:text-primary">{product.name}</h3>
        </Link>
        <div className="mb-3">
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through block">{formatPrice(product.originalPrice)}</span>
          )}
          <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground ml-1">à vista</span>
        </div>
        <Button onClick={handleAdd} className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm gap-2">
          <ShoppingBag className="h-4 w-4" /> Adicionar
        </Button>
      </div>
    </div>
  );
};

const ProductGrid = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Mais vendidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
