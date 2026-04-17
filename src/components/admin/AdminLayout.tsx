import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Tag, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="container mx-auto p-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/produtos", label: "Produtos", icon: Package, end: false },
    { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, end: false },
    { to: "/admin/categorias", label: "Categorias", icon: Tag, end: false },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg">Painel Admin</h1>
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Voltar à loja
          </Link>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-card border border-border rounded-lg p-3 h-fit">
          <nav className="space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`
                }
              >
                <l.icon className="h-4 w-4" /> {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
