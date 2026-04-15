import { Heart, ShoppingBag, Star } from "lucide-react";
import { featuredProducts, type Product } from "@/data/products";
import { Button } from "@/components/ui/button";

const ProductCard = ({ product }: { product: Product }) => {
  const formatPrice = (price: number) =>
    price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
            {product.badge}
          </span>
        )}
        <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
          <Heart className="h-4 w-4 text-foreground" />
        </button>
      </div>
      <div className="p-3 md:p-4">
        {/* Star rating */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < 4 ? "fill-[hsl(38,60%,50%)] text-[hsl(38,60%,50%)]" : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
          {product.line}
        </p>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="mb-3">
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through block">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">à vista</span>
        </div>
        <Button className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm gap-2">
          <ShoppingBag className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
};

const ProductGrid = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
          Mais vendidos
        </h2>
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