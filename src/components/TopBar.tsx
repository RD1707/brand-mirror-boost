import { Gift, Truck, CreditCard } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-center text-xs md:text-sm">
      <div className="container mx-auto flex items-center justify-center gap-6 px-4">
        <span className="flex items-center gap-1">
          <Truck className="h-3.5 w-3.5" />
          Frete grátis acima de R$149
        </span>
        <span className="hidden md:flex items-center gap-1">
          <CreditCard className="h-3.5 w-3.5" />
          Parcele em até 10x sem juros
        </span>
        <span className="hidden lg:flex items-center gap-1">
          <Gift className="h-3.5 w-3.5" />
          Ganhe brindes exclusivos
        </span>
      </div>
    </div>
  );
};

export default TopBar;
