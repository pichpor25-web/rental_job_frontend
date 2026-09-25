import React from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PropertyCard from "../components/property/PropertyCard";
import PropertyHeader from "../components/property/HeaderProperty";

function Propertypage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <PropertyHeader />
        <PropertyCard />
      </main>
      <Footer />
    </div>
  );
}

export default Propertypage;
