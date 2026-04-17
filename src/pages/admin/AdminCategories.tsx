import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/integrations/supabase/db-types";
import { useToast } from "@/hooks/use-toast";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminCategories = () => {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("display_order");
      return (data ?? []) as Category[];
    },
  });

  const handleAdd = async () => {
    if (!name) return;
    const { error } = await supabase.from("categories").insert({
      name, slug: slugify(name), image_url: imageUrl || null,
    });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Categoria criada" });
    setName(""); setImageUrl("");
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir categoria?")) return;
    await supabase.from("categories").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Categorias</h2>
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-sm">Nova categoria</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="URL da imagem" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Button onClick={handleAdd} className="gap-2"><Plus className="h-4 w-4" /> Adicionar</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading && <p className="text-muted-foreground text-sm">Carregando...</p>}
        {(data ?? []).map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
            <img src={c.image_url ?? "/placeholder.svg"} className="w-12 h-12 rounded object-cover" alt="" />
            <div className="flex-1">
              <p className="font-medium text-sm">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.slug}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
