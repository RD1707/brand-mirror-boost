import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const navLinks = [
  "Perfumaria",
  "Maquiagem",
  "Cabelos",
  "Corpo e Banho",
  "Rosto",
  "Presentes",
  "Masculino",
  "Promoções",
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm">
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
          <span className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
            Boticário
          </span>
        </a>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <Input
            placeholder="O que você está procurando?"
            className="pr-10 rounded-full border-border"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 md:gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
              0
            </span>
          </Button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-t border-border">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-8 py-2.5 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border bg-background">
          <ul className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="block py-2.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors border-b border-border/50"
                >
                  {link}
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
