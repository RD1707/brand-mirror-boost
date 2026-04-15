import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const footerLinks = {
  "Institucional": ["Sobre o Boticário", "Trabalhe Conosco", "Programa de Fidelidade", "Sustentabilidade"],
  "Ajuda": ["Central de Atendimento", "Como Comprar", "Prazo de Entrega", "Política de Trocas"],
  "Minha Conta": ["Meus Pedidos", "Meus Dados", "Meus Endereços", "Lista de Desejos"],
};

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-bold text-background mb-4 block">
              Boticário
            </span>
            <p className="text-sm opacity-70 mb-4">
              Beleza que transforma há mais de 45 anos.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-background transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-background transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-background transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-background transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-background text-sm mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs hover:text-background transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-60">
            © 2025 O Boticário. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs opacity-60">
            <a href="#" className="hover:opacity-100">Termos de Uso</a>
            <a href="#" className="hover:opacity-100">Política de Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
