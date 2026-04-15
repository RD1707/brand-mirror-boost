import { categories } from "@/data/categories";

const CategoryCards = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
          Navegue por categoria
        </h2>
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href="#"
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs md:text-sm font-medium text-foreground/80 text-center max-w-[80px] md:max-w-[96px]">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
