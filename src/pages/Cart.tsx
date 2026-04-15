import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";

const Cart = () => {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sua sacola está vazia</h1>
          <p className="text-muted-foreground mb-6">Que tal explorar nossos produtos?</p>
          <Link to="/">
            <Button>Continuar comprando</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Minha Sacola ({totalItems} {totalItems === 1 ? "item" : "itens"})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-card border border-border rounded-lg p-4">
                <Link to={`/produto/${item.product.slug}`}>
                  <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded" />
                </Link>
                <div className="flex-1">
                  <Link to={`/produto/${item.product.slug}`} className="text-sm font-medium hover:text-primary">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">{item.product.line}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-muted">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-muted">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-lg p-6 h-fit space-y-4">
            <h2 className="font-bold text-lg">Resumo do pedido</h2>

            {/* CEP */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Calcular frete</label>
              <div className="flex gap-2">
                <Input placeholder="CEP" className="text-sm" />
                <Button variant="outline" size="sm">OK</Button>
              </div>
            </div>

            {/* Coupon */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                <Tag className="h-3 w-3" /> Cupom de desconto
              </label>
              <div className="flex gap-2">
                <Input placeholder="Código" className="text-sm" />
                <Button variant="outline" size="sm">Aplicar</Button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Frete</span>
                <span className="text-muted-foreground">A calcular</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full rounded-lg mt-2" size="lg">Finalizar compra</Button>
            </Link>
            <Link to="/" className="block text-center text-sm text-primary hover:underline">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
