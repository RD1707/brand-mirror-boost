import { promoBanners } from "@/data/banners";
import { Button } from "@/components/ui/button";

const PromoBanner = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {promoBanners.map((banner) => (
            <div
              key={banner.id}
              className="relative rounded-xl overflow-hidden group cursor-pointer"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-[200px] md:h-[280px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-1">
                    {banner.title}
                  </h3>
                  <p className="text-sm opacity-90 mb-3">{banner.subtitle}</p>
                  <Button
                    variant="outline"
                    className="rounded-full border-white text-white hover:bg-white hover:text-foreground text-sm"
                  >
                    {banner.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
