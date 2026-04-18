import { Search, User, ShoppingBag, Menu, MapPin, ChevronDown, Shield, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAdmin } from "@/hooks/useAdmin";
import logoSvg from "@/assets/logo.svg";

const navLinks: { label: string; slug: string; highlight?: boolean }[] = [
  { label: "Presentes", slug: "presentes", highlight: true },
  { label: "Lançamentos", slug: "lancamentos" },
  { label: "Promos", slug: "promos" },
  { label: "Outlet", slug: "outlet" },
  { label: "Perfumaria", slug: "perfumaria" },
  { label: "Corpo e Banho", slug: "corpo-e-banho" },
  { label: "Make", slug: "maquiagem" },
  { label: "Cabelos", slug: "cabelos" },
  { label: "Skincare", slug: "skincare" },
  { label: "Infantil", slug: "infantil" },
  { label: "Masculino", slug: "masculino" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAdmin } = useAdmin();

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-3 md:gap-4 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <Link to="/" className="flex-shrink-0">
          <img src={logoSvg} alt="O Boticário" className="h-7 md:h-9 w-auto" />
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl relative">
          <Input placeholder="O que você procura hoje?" className="pr-10 rounded-lg border-border bg-card" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buscar">
            <Search className="h-5 w-5" />
          </Button>
          <a href="#" className="hidden xl:flex items-center gap-1 text-xs text-foreground/70 hover:text-primary transition-colors">
            <MapPin className="h-4 w-4" />
            <span>Informar localização</span>
            <ChevronDown className="h-3 w-3" />
          </a>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1 text-xs text-primary">
                <Shield className="h-4 w-4" /> Admin
              </Button>
            </Link>
          )}
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1 text-xs text-foreground/70">
              <User className="h-4 w-4" /> Entrar <ChevronDown className="h-3 w-3" />
            </Button>
          </Link>
          <Link to="/login" className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Entrar"><User className="h-5 w-5" /></Button>
          </Link>
          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative" aria-label="Carrinho">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Input placeholder="O que você procura hoje?" className="pr-10 rounded-lg border-border bg-card" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <nav className="hidden lg:block border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-4 xl:gap-6 py-2.5 text-sm font-medium overflow-x-auto">
            {navLinks.map((link) => (
              <li key={link.slug} className="whitespace-nowrap">
                {link.highlight ? (
                  <Link
                    to={`/categoria/${link.slug}`}
                    className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wide hover:bg-primary/90 transition-colors"
                  >
                    ATÉ 30% OFF EM PRESENTES
                  </Link>
                ) : (
                  <Link
                    to={`/categoria/${link.slug}`}
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-card max-h-[70vh] overflow-y-auto">
          <ul className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <li key={link.slug}>
                <Link
                  to={`/categoria/${link.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 text-sm font-medium transition-colors border-b border-border/50 ${
                    link.highlight ? "text-primary font-bold" : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {link.highlight ? "🎁 Presentes - Até 30% OFF" : link.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 mt-1 border-t border-border">
              <Link
                to="/minha-conta"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs text-foreground/70 hover:text-primary"
              >
                📋 Meus Pedidos
              </Link>
              <Link
                to="/favoritos"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs text-foreground/70 hover:text-primary"
              >
                ♡ Favoritos
              </Link>
              <Link
                to="/ajuda"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs text-foreground/70 hover:text-primary"
              >
                Precisa de ajuda?
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
