import { useState } from "react";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";

type Section = "dados" | "pedidos" | "enderecos" | "favoritos";

const menuItems: { key: Section; label: string; icon: typeof User }[] = [
  { key: "dados", label: "Meus Dados", icon: User },
  { key: "pedidos", label: "Meus Pedidos", icon: Package },
  { key: "enderecos", label: "Endereços", icon: MapPin },
  { key: "favoritos", label: "Favoritos", icon: Heart },
];

const mockOrders = [
  { id: "BOT-2024-001", date: "12/04/2024", status: "Entregue", total: 289.70 },
  { id: "BOT-2024-002", date: "25/03/2024", status: "Em transporte", total: 159.90 },
  { id: "BOT-2024-003", date: "10/03/2024", status: "Entregue", total: 94.90 },
];

const MyAccount = () => {
  const [section, setSection] = useState<Section>("dados");
  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-card border border-border rounded-lg p-4 h-fit">
            <div className="text-center mb-4 pb-4 border-b border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">Maria Silva</p>
              <p className="text-xs text-muted-foreground">maria@email.com</p>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${section === item.key ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-muted"}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {section === "dados" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Meus Dados</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground block mb-1">Nome</label><Input defaultValue="Maria Silva" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">E-mail</label><Input defaultValue="maria@email.com" /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">CPF</label><Input defaultValue="123.456.789-00" disabled /></div>
                  <div><label className="text-sm text-muted-foreground block mb-1">Telefone</label><Input defaultValue="(11) 99999-0000" /></div>
                </div>
                <Button className="rounded-lg">Salvar alterações</Button>
              </div>
            )}

            {section === "pedidos" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Meus Pedidos</h2>
                {mockOrders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${order.status === "Entregue" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                  </div>
                ))}
              </div>
            )}

            {section === "enderecos" && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-bold">Endereços</h2>
                <div className="border border-border rounded-lg p-4">
                  <p className="font-medium text-sm">Casa</p>
                  <p className="text-sm text-muted-foreground">Rua das Flores, 123 - Apto 45</p>
                  <p className="text-sm text-muted-foreground">Jardim Paulista - São Paulo/SP - 01234-000</p>
                </div>
                <Button variant="outline" className="rounded-lg">Adicionar endereço</Button>
              </div>
            )}

            {section === "favoritos" && (
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-bold mb-2">Nenhum favorito ainda</h2>
                <p className="text-sm text-muted-foreground">Explore nossos produtos e salve seus favoritos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;
