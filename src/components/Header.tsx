import { Search, User, ShoppingBag, Menu, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logoSvg from "@/assets/logo.svg";

const navLinks = [
  { label: "Presentes", highlight: true },
  { label: "Lançamentos" },
  { label: "Promos" },
  { label: "Outlet" },
  { label: "Perfumaria" },
  { label: "Corpo e Banho" },
  { label: "Make" },
  { label: "Cabelos" },
  { label: "Skincare" },
  { label: "Infantil" },
  { label: "Masculino" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Main header */}
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <a href="/" className="flex-shrink-0">
          <img
            src={logoSvg}
            alt="O Boticário"
            className="h-7 md:h-9 w-auto"
          />
        </a>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <Input
            placeholder="O que você procura hoje?"
            className="pr-10 rounded-lg border-border bg-card"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 md:gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          <a href="#" className="hidden lg:flex items-center gap-1 text-xs text-foreground/70 hover:text-primary transition-colors">
            <MapPin className="h-4 w-4" />
            <span>Informar localização</span>
            <ChevronDown className="h-3 w-3" />
          </a>
          <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1 text-xs text-foreground/70">
            <User className="h-4 w-4" />
            Entrar
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-6 py-2.5 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.highlight ? (
                  <a
                    href="#"
                    className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wide hover:bg-primary/90 transition-colors"
                  >
                    ATÉ 30% OFF EM PRESENTES
                  </a>
                ) : (
                  <a
                    href="#"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-card">
          <ul className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href="#"
                  className={`block py-2.5 text-sm font-medium transition-colors border-b border-border/50 ${
                    link.highlight
                      ? "text-primary font-bold"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {link.highlight ? "🎁 Presentes - Até 30% OFF" : link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;