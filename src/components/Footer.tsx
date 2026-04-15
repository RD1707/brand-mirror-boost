import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import logoSvg from "@/assets/logo.svg";

const footerColumns = {
  "Dúvidas": [
    "Perguntas Frequentes",
    "Formas de Pagamento",
    "Frete e Entrega",
    "Trocas e Devoluções",
    "Mapa do Site",
  ],
  "Marcas": [
    "Quem Disse, Berenice?",
    "Eudora",
    "Beleza na Web",
    "Vult",
    "O.U.i",
    "Truss",
    "Dr Jones",
  ],
  "Responsabilidade": [
    "Nossos Projetos",
    "Nossa História",
    "Sustentabilidade",
    "Diversidade",
    "Relatório Transparente",
  ],
  "Links úteis": [
    "Política de Privacidade",
    "Proteja-se Contra Fraudes",
    "Preferências de Cookies",
    "Código de Defesa do Consumidor",
    "consumidor.gov",
    "Termos de Uso",
    "Alerta Sobre Segurança",
  ],
};

const paymentIcons = ["VISA", "Mastercard", "Amex", "Elo", "Diners", "Pix"];

const Footer = () => {
  return (
    <footer className="bg-[hsl(40,30%,96%)] text-foreground">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-foreground text-sm mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-foreground/60 hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social + Brand */}
          <div>
            <h4 className="font-bold text-foreground text-sm mb-3">
              A empresa nas redes
            </h4>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-foreground/50">Pode Confiar</p>
            <p className="text-sm font-bold text-foreground/70">GrupoBoticário</p>
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
          <p className="text-xs text-foreground/50">
            Até 10x sem juros no cartão. Confira as regras
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="O Boticário" className="h-5 w-auto opacity-40" />
          </div>
          <p className="text-xs text-foreground/40 text-center">
            Os preços da loja online podem variar em relação às lojas físicas.
          </p>
          <p className="text-xs text-foreground/40">
            BOTICÁRIO PRODUTOS DE BELEZA LTDA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;