import Hero from "../../components/sections/Hero.jsx";
import CategoriesSection from "../../components/sections/CategoriesSection.jsx";
import FeaturedProducts from "../../components/sections/FeaturedProducts.jsx";
import SuppliersSection from "../../components/sections/SuppliersSection.jsx";
import HowItWorks from "../../components/sections/HowItWorks.jsx";
import WhyChooseUs from "../../components/sections/WhyChooseUs.jsx";
import CTASection from "../../components/sections/CTASection.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedProducts />
      <SuppliersSection />
      <HowItWorks />
      <WhyChooseUs />
      <CTASection />
    </>
  );
}
