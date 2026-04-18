import { Link } from "react-router-dom";

const TopBar = () => {
  return (
    <>
      {/* Promo banner - golden/warm */}
      <div className="bg-[hsl(38,60%,50%)] text-white py-2.5 text-center text-xs md:text-sm font-bold tracking-wide">
        <div className="container mx-auto px-4">
          <Link to="/categoria/presentes" className="hover:underline">
            Dia das Mães <span className="font-normal">|</span>{" "}
            <span className="font-normal">Presentes com até</span>{" "}
            <strong>30% OFF</strong> + Cashback
          </Link>
        </div>
      </div>

      {/* Utility bar - beige/cream */}
      <div className="bg-[hsl(40,30%,96%)] border-b border-border text-xs text-foreground/70 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between py-1.5">
          <div className="flex items-center gap-6">
            <Link to="/acessibilidade" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="text-primary">●</span> Acessibilidade
            </Link>
            <Link to="/grupo-boticario" className="hover:text-primary transition-colors">Grupo Boticário</Link>
            <Link to="/ajuda" className="hover:text-primary transition-colors">Precisa de ajuda?</Link>
            <Link to="/revendedor" className="hover:text-primary transition-colors">Portal do Revendedor</Link>
            <Link to="/quero-revender" className="hover:text-primary transition-colors">Quero Revender</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/minha-conta" className="hover:text-primary transition-colors flex items-center gap-1">
              📋 Meus Pedidos
            </Link>
            <Link to="/favoritos" className="hover:text-primary transition-colors flex items-center gap-1">
              ♡ Favoritos
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;
