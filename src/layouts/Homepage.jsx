import Navbar from "../components/common/Navbar";
import HeroBanner from "../components/common/Banner";
import Footer from "../components/common/Footer";
import WhyChooseUs from "../components/sections/WhyChooseUs";
import PopularLocations from "../components/sections/PopularLocations";
import SmartInvestments from "../components/sections/SmartInvestments";
import Testimonials from "../components/sections/Testimonials";
import Service from "../components/sections/Services";
import FeatureProperty from "../components/property/FeaturedProperties";

function Homepage() {
  return (
    <main className="min-h-screen bg-[#FBFBFA]">
      <Navbar />
      <HeroBanner />
      <FeatureProperty />
      <WhyChooseUs />
      <Service />
      <PopularLocations />
      <SmartInvestments />
      <Testimonials />
      <Footer />
    </main>
  );
}

export default Homepage;
