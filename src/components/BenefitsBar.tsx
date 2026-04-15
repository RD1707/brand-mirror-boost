import { Truck, ShieldCheck, RotateCcw, CreditCard } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Frete Grátis",
    description: "Acima de R$149",
  },
  {
    icon: CreditCard,
    title: "Parcelamento",
    description: "Em até 10x sem juros",
  },
  {
    icon: ShieldCheck,
    title: "Compra Segura",
    description: "Ambiente 100% protegido",
  },
  {
    icon: RotateCcw,
    title: "Troca Fácil",
    description: "Até 15 dias para trocar",
  },
];

const BenefitsBar = () => {
  return (
    <section className="py-8 md:py-10 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col items-center text-center gap-2"
            >
              <benefit.icon className="h-7 w-7 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsBar;
