import Layout from "@/components/Layout";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryCards from "@/components/CategoryCards";
import ProductGrid from "@/components/ProductGrid";
import PromoBanner from "@/components/PromoBanner";
import BrandHighlights from "@/components/BrandHighlights";
import BenefitsBar from "@/components/BenefitsBar";
import Newsletter from "@/components/Newsletter";

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <CategoryCards />
      <ProductGrid />
      <PromoBanner />
      <BrandHighlights />
      <BenefitsBar />
      <Newsletter />
    </Layout>
  );
};

export default Index;
