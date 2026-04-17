import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, DollarSign, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-card border border-border rounded-lg p-5">
    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
      <Icon className="h-4 w-4" /> {label}
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, paid, pending] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total").eq("status", "paid"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      const revenue = (paid.data ?? []).reduce((s, o: any) => s + Number(o.total), 0);
      return {
        products: products.count ?? 0,
        orders: orders.count ?? 0,
        revenue,
        pending: pending.count ?? 0,
      };
    },
  });

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Visão geral</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Package} label="Produtos" value={String(data?.products ?? 0)} />
        <Stat icon={ShoppingBag} label="Pedidos totais" value={String(data?.orders ?? 0)} />
        <Stat icon={DollarSign} label="Receita (pagos)" value={formatPrice(data?.revenue ?? 0)} />
        <Stat icon={Clock} label="Pendentes" value={String(data?.pending ?? 0)} />
      </div>
    </div>
  );
};

export default AdminDashboard;
