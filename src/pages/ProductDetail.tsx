import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag, Star, Minus, Plus, ChevronRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/integrations/supabase/db-types";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"descricao" | "ingredientes" | "modo-uso">("descricao");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["product-related", product?.id],
    enabled: !!product,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .neq("id", product!.id)
        .limit(4);
      return (data ?? []) as Product[];
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link to="/" className="text-primary hover:underline">Voltar à página inicial</Link>
        </div>
      </Layout>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url ?? "/placeholder.svg"];
  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image_url: product.image_url,
      line: product.line,
    }, quantity);
    toast({ title: "Produto adicionado!", description: `${product.name} foi adicionado à sua sacola.` });
  };

  return (
    <Layout>
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-3 text-xs text-muted-foreground flex items-center gap-1">
          <Link to="/" className="hover:text-primary">Início</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.line ?? product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="relative rounded-lg overflow-hidden border border-border mb-3">
              <img src={images[selectedImage]} alt={product.name} className="w-full aspect-square object-cover" />
              {product.badge && (
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded">
                  {product.badge}
                </span>
              )}
              <button className="absolute top-3 right-3 p-2 bg-card/80 rounded-full hover:bg-card">
                <Heart className="h-5 w-5 text-foreground" />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded border-2 overflow-hidden ${i === selectedImage ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.line && (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{product.line}</p>
            )}
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(Number(product.rating)) ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.review_count} avaliações)</span>
            </div>

            <div className="mb-6">
              {product.original_price && (
                <span className="text-sm text-muted-foreground line-through block">
                  {formatPrice(Number(product.original_price))}
                </span>
              )}
              <span className="text-3xl font-bold text-primary">{formatPrice(Number(product.price))}</span>
              <span className="text-sm text-muted-foreground ml-2">à vista</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-muted">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-muted">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 rounded-lg gap-2" size="lg">
                <ShoppingBag className="h-5 w-5" />
                Adicionar à sacola
              </Button>
            </div>

            <Link to="/carrinho">
              <Button variant="outline" className="w-full rounded-lg mb-6" size="lg">
                Ir para o carrinho
              </Button>
            </Link>

            <div className="border border-border rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Calcule o frete</span>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Digite seu CEP" className="text-sm" />
                <Button variant="outline" size="sm">Calcular</Button>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex gap-6 border-b border-border mb-4">
                {([
                  { key: "descricao", label: "Descrição" },
                  { key: "ingredientes", label: "Ingredientes" },
                  { key: "modo-uso", label: "Modo de Uso" },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed">
                {activeTab === "descricao" && <p>{product.description ?? "Sem descrição."}</p>}
                {activeTab === "ingredientes" && <p>Consulte a embalagem para a lista completa de ingredientes.</p>}
                {activeTab === "modo-uso" && <p>Aplique conforme a indicação na embalagem do produto.</p>}
              </div>
            </div>
          </div>
        </div>

        {related && related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-foreground mb-6">Produtos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link key={p.id} to={`/produto/${p.slug}`} className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={p.image_url ?? "/placeholder.svg"} alt={p.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="p-3">
                    {p.line && <p className="text-xs text-muted-foreground uppercase">{p.line}</p>}
                    <h3 className="text-sm font-medium line-clamp-2 mb-2">{p.name}</h3>
                    <span className="text-base font-bold text-primary">{formatPrice(Number(p.price))}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
