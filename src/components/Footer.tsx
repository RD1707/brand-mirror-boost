import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";

type FooterLink = { label: string; to: string };

const footerColumns: Record<string, FooterLink[]> = {
  "Dúvidas": [
    { label: "Perguntas Frequentes", to: "/info/perguntas-frequentes" },
    { label: "Formas de Pagamento", to: "/info/formas-de-pagamento" },
    { label: "Frete e Entrega", to: "/info/frete-e-entrega" },
    { label: "Trocas e Devoluções", to: "/info/trocas-e-devolucoes" },
    { label: "Mapa do Site", to: "/info/mapa-do-site" },
  ],
  "Marcas": [
    { label: "Quem Disse, Berenice?", to: "/info/marca-quem-disse-berenice" },
    { label: "Eudora", to: "/info/marca-eudora" },
    { label: "Beleza na Web", to: "/info/marca-beleza-na-web" },
    { label: "Vult", to: "/info/marca-vult" },
    { label: "O.U.i", to: "/info/marca-oui" },
    { label: "Truss", to: "/info/marca-truss" },
    { label: "Dr Jones", to: "/info/marca-dr-jones" },
  ],
  "Responsabilidade": [
    { label: "Nossos Projetos", to: "/info/nossos-projetos" },
    { label: "Nossa História", to: "/info/nossa-historia" },
    { label: "Sustentabilidade", to: "/info/sustentabilidade" },
    { label: "Diversidade", to: "/info/diversidade" },
    { label: "Relatório Transparente", to: "/info/relatorio-transparente" },
  ],
  "Links úteis": [
    { label: "Política de Privacidade", to: "/info/politica-de-privacidade" },
    { label: "Proteja-se Contra Fraudes", to: "/info/proteja-se-contra-fraudes" },
    { label: "Preferências de Cookies", to: "/info/preferencias-de-cookies" },
    { label: "Código de Defesa do Consumidor", to: "/info/codigo-de-defesa-do-consumidor" },
    { label: "consumidor.gov", to: "/info/consumidor-gov" },
    { label: "Termos de Uso", to: "/info/termos-de-uso" },
    { label: "Alerta Sobre Segurança", to: "/info/alerta-sobre-seguranca" },
  ],
};

const paymentIcons = ["VISA", "Mastercard", "Amex", "Elo", "Diners", "Pix"];

const Footer = () => {
  return (
    <footer className="bg-[hsl(40,30%,96%)] text-foreground">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-foreground text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs text-foreground/60 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social + Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h4 className="font-bold text-foreground text-sm mb-3">A empresa nas redes</h4>
            <div className="flex gap-3 mb-6">
              <a href="#" aria-label="YouTube" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-foreground/50">Pode Confiar</p>
            <Link to="/grupo-boticario" className="text-sm font-bold text-foreground/70 hover:text-primary">
              GrupoBoticário
            </Link>
          </div>
        </div>

        {/* Payment */}
        <div className="border-t border-border mt-10 pt-6">
          <h4 className="font-bold text-foreground text-sm mb-3">Pagamento</h4>
          <div className="flex gap-2 flex-wrap mb-2">
            {paymentIcons.map((icon) => (
              <span
                key={icon}
                className="border border-border rounded px-3 py-1.5 text-xs text-foreground/60 bg-card"
              >
                {icon}
              </span>
            ))}
          </div>
          <Link to="/info/formas-de-pagamento" className="text-xs text-foreground/50 hover:text-primary">
            Até 10x sem juros no cartão. Confira as regras
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoSvg} alt="O Boticário" className="h-5 w-auto opacity-40" />
          </Link>
          <p className="text-xs text-foreground/40 text-center">
            Os preços da loja online podem variar em relação às lojas físicas.
          </p>
          <p className="text-xs text-foreground/40 text-center md:text-right">
            BOTICÁRIO PRODUTOS DE BELEZA LTDA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
