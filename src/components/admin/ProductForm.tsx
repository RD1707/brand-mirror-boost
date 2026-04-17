import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category } from "@/integrations/supabase/db-types";

interface Props {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const ProductForm = ({ product, categories, onClose, onSaved }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", line: "", description: "",
    price: 0, original_price: 0,
    image_url: "", category_id: "", badge: "",
    stock: 100, featured: false, active: true,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        line: product.line ?? "",
        description: product.description ?? "",
        price: Number(product.price),
        original_price: Number(product.original_price ?? 0),
        image_url: product.image_url ?? "",
        category_id: product.category_id ?? "",
        badge: product.badge ?? "",
        stock: product.stock,
        featured: product.featured,
        active: product.active,
      });
    }
  }, [product]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      original_price: form.original_price > 0 ? form.original_price : null,
      category_id: form.category_id || null,
      badge: form.badge || null,
    };
    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: product ? "Produto atualizado" : "Produto criado" });
    onSaved();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm mb-1 block">Nome</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Linha</label>
              <Input value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Preço (R$)</label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Preço original (opcional)</label>
              <Input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Categoria</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">— sem categoria —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm mb-1 block">Badge (ex: 20% OFF)</label>
              <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            </div>
            <div>
              <label className="text-sm mb-1 block">Estoque</label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <label className="text-sm mb-1 block">Descrição</label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-sm mb-1 block">Imagem</label>
              <div className="flex items-center gap-3">
                {form.image_url && <img src={form.image_url} className="w-16 h-16 rounded object-cover" alt="" />}
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} />
              </div>
              <Input className="mt-2" placeholder="ou cole uma URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              <label className="text-sm">Destaque</label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <label className="text-sm">Ativo</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
