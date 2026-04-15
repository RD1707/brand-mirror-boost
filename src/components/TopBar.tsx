const TopBar = () => {
  return (
    <>
      {/* Promo banner - golden/warm */}
      <div className="bg-[hsl(38,60%,50%)] text-white py-2.5 text-center text-xs md:text-sm font-bold tracking-wide">
        <div className="container mx-auto px-4">
          <span>
            Dia das Mães{" "}
            <span className="font-normal">|</span>{" "}
            <span className="font-normal">Presentes com até</span>{" "}
            <strong>30% OFF</strong> + Cashback
          </span>
        </div>
      </div>

      {/* Utility bar - beige/cream */}
      <div className="bg-[hsl(40,30%,96%)] border-b border-border text-xs text-foreground/70 hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between py-1.5">
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="text-primary">●</span> Acessibilidade
            </a>
            <a href="#" className="hover:text-primary transition-colors">Grupo Boticário</a>
            <a href="#" className="hover:text-primary transition-colors">Precisa de ajuda?</a>
            <a href="#" className="hover:text-primary transition-colors">Portal do Revendedor</a>
            <a href="#" className="hover:text-primary transition-colors">Quero Revender</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              📋 Meus Pedidos
            </a>
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              ♡ Favoritos
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;