import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryCards from "@/components/CategoryCards";
import ProductGrid from "@/components/ProductGrid";
import PromoBanner from "@/components/PromoBanner";
import BrandHighlights from "@/components/BrandHighlights";
import BenefitsBar from "@/components/BenefitsBar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        <HeroCarousel />
        <CategoryCards />
        <ProductGrid />
        <PromoBanner />
        <BrandHighlights />
        <BenefitsBar />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
