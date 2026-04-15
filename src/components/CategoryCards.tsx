import { ArrowRight } from "lucide-react";

const highlightSections = [
  {
    id: 1,
    title: "Em alta",
    products: [
      { image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=120&h=120&fit=crop", discount: "-29%" },
      { image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=120&h=120&fit=crop", discount: "-11%" },
      { image: "https://images.unsplash.com/photo-1594035910387-fbc370765ad8?w=120&h=120&fit=crop", discount: "-15%" },
    ],
  },
  {
    id: 2,
    title: "Lançamentos",
    products: [
      { image: "https://images.unsplash.com/photo-1570194065650-d99fb4ee3313?w=120&h=120&fit=crop", discount: "-18%" },
      { image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=120&h=120&fit=crop", discount: "-20%" },
      { image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=120&h=120&fit=crop" },
    ],
  },
  {
    id: 3,
    title: "Promoções",
    products: [
      { image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=120&h=120&fit=crop", discount: "-26%" },
      { image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=120&h=120&fit=crop", discount: "-23%" },
      { image: "https://images.unsplash.com/photo-1549465220-1a8b9238f094?w=120&h=120&fit=crop", discount: "-29%" },
    ],
  },
];

const CategoryCards = () => {
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {highlightSections.map((section) => (
            <div
              key={section.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <h3 className="text-base font-bold text-foreground mb-4">
                {section.title}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                {section.products.map((product, idx) => (
                  <div key={idx} className="relative flex-1">
                    <img
                      src={product.image}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    {product.discount && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {product.discount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <a
                href="#"
                className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
              >
                Ver produtos <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;