import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { User, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Order, Profile } from "@/integrations/supabase/db-types";

type Section = "dados" | "pedidos";

const MyAccount = () => {
  const [section, setSection] = useState<Section>("dados");
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data as Profile | null;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return (data ?? []) as Order[];
    },
  });

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Dados atualizados!" });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-4 h-fit">
            <div className="text-center mb-4 pb-4 border-b border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">{profile?.full_name ?? "Cliente"}</p>
              <p className="text-xs text-muted-foreground break-all">{user.email}</p>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setSection("dados")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${section === "dados" ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted"}`}
              >
                <User className="h-4 w-4" /> Meus Dados
              </button>
              <button
                onClick={() => setSection("pedidos")}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${section === "pedidos" ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted"}`}
              >
                <Package className="h-4 w-4" /> Meus Pedidos
              </button>
              <button
                onClick={async () => { await signOut(); navigate("/"); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </nav>
          </div>

          <div className="md:col-span-3">
            {section === "dados" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Meus Dados</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground block mb-1">Nome</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">E-mail</label><Input value={user.email ?? ""} disabled /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Telefone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                </div>
                <Button onClick={handleSave} className="rounded-lg">Salvar alterações</Button>
              </div>
            )}

            {section === "pedidos" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Meus Pedidos</h2>
                {(orders ?? []).length === 0 && (
                  <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                    Você ainda não tem pedidos.
                  </div>
                )}
                {(orders ?? []).map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary capitalize">
                      {order.status}
                    </span>
                    <span className="font-bold text-sm">{formatPrice(Number(order.total))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;
