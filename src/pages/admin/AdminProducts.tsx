import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/integrations/supabase/db-types";
import { useToast } from "@/hooks/use-toast";
import ProductForm from "@/components/admin/ProductForm";

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("display_order");
      return (data ?? []) as Category[];
    },
  });

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Produto excluído" });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const filtered = (products ?? []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Produtos</h2>
        <Button onClick={() => setCreating(true)} className="gap-2"><Plus className="h-4 w-4" /> Novo produto</Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">Preço</th>
              <th className="text-left p-3">Estoque</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Carregando...</td></tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url ?? "/placeholder.svg"} alt="" className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.line}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{formatPrice(Number(p.price))}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${p.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductForm
          product={editing}
          categories={categories ?? []}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => qc.invalidateQueries({ queryKey: ["admin-products"] })}
        />
      )}
    </div>
  );
};

export default AdminProducts;
