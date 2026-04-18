import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Home, Heart, ShoppingBag, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category as CategoryType } from "@/integrations/supabase/db-types";

// Slugs especiais que filtram por badge/promoção em vez de categoria
const SPECIAL_SLUGS: Record<string, { title: string; subtitle: string }> = {
  lancamentos: { title: "Lançamentos", subtitle: "Descubra as novidades que acabaram de chegar." },
  promos: { title: "Promoções", subtitle: "Ofertas imperdíveis em toda a loja." },
  outlet: { title: "Outlet", subtitle: "Os melhores descontos em produtos selecionados." },
  presentes: { title: "Presentes", subtitle: "Ideias especiais para presentear quem você ama." },
};

const formatPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image_url: product.image_url,
      line: product.line,
    });
    toast({ title: "Adicionado!", description: `${product.name} foi adicionado à sacola.` });
  };

  return (
    <div className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/produto/${product.slug}`} className="block relative">
        <img
          src={product.image_url ?? "/placeholder.svg"}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
            {product.badge}
          </span>
        )}
        <button className="absolute top-2 right-2 p-1.5 bg-card/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
          <Heart className="h-4 w-4 text-foreground" />
        </button>
      </Link>
      <div className="p-3 md:p-4">
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.round(Number(product.rating)) ? "fill-accent text-accent" : "fill-muted text-muted"
              }`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">({product.review_count})</span>
        </div>
        {product.line && (
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{product.line}</p>
        )}
        <Link to={`/produto/${product.slug}`}>
          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem] hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mb-3">
          {product.original_price && (
            <span className="text-xs text-muted-foreground line-through block">
              {formatPrice(Number(product.original_price))}
            </span>
          )}
          <span className="text-lg font-bold text-primary">{formatPrice(Number(product.price))}</span>
          <span className="text-xs text-muted-foreground ml-1">à vista</span>
        </div>
        <Button onClick={handleAdd} className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm gap-2">
          <ShoppingBag className="h-4 w-4" /> Adicionar
        </Button>
      </div>
    </div>
  );
};

const Category = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const special = SPECIAL_SLUGS[slug];

  const { data, isLoading } = useQuery({
    queryKey: ["category-products", slug],
    queryFn: async () => {
      if (special) {
        let query = supabase.from("products").select("*").eq("active", true);
        if (slug === "promos" || slug === "outlet") {
          query = query.not("original_price", "is", null);
        } else if (slug === "lancamentos") {
          query = query.order("created_at", { ascending: false }).limit(24);
        } else if (slug === "presentes") {
          query = query.eq("featured", true);
        }
        const { data: products, error } = await query;
        if (error) throw error;
        return { category: null as CategoryType | null, products: (products ?? []) as Product[] };
      }

      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!cat) return { category: null, products: [] as Product[] };

      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("category_id", (cat as CategoryType).id);
      if (error) throw error;
      return { category: cat as CategoryType, products: (products ?? []) as Product[] };
    },
  });

  const title = special?.title ?? data?.category?.name ?? "Categoria";
  const subtitle = special?.subtitle;
  const products = data?.products ?? [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-10">
        <nav className="flex items-center gap-1.5 text-xs text-foreground/60 mb-5">
          <Link to="/" className="flex items-center gap-1 hover:text-primary">
            <Home className="h-3 w-3" /> Início
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{title}</span>
        </nav>

        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1.5">{title}</h1>
          {subtitle && <p className="text-sm text-foreground/60">{subtitle}</p>}
          {!isLoading && (
            <p className="text-xs text-foreground/50 mt-2">
              {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
          )}
        </header>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-10 md:p-14 text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">Nenhum produto por aqui ainda</h2>
            <p className="text-sm text-foreground/60 mb-6">
              Em breve teremos novidades nesta categoria. Que tal explorar o restante da loja?
            </p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Category;
