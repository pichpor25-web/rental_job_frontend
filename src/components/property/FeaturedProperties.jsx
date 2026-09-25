import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Maximize2, ArrowRight } from "lucide-react";

// Example data with more than 3 items
const FEATURED_PROPERTIES = [
  {
    id: 1,
    tag: "For Sale",
    tagColor:
      "bg-emerald-950/70 text-emerald-300 backdrop-blur-md border border-emerald-500/20",
    title: "Luxury Villa with Private Pool",
    location: "Dubai, UAE",
    price: "$2,850,000",
    priceSuffix: "",
    beds: 5,
    baths: 4,
    sqft: "6,200",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    tag: "For Sale",
    tagColor:
      "bg-emerald-950/70 text-emerald-300 backdrop-blur-md border border-emerald-500/20",
    title: "Modern Apartment in Downtown",
    location: "New York, USA",
    price: "$1,250,000",
    priceSuffix: "",
    beds: 3,
    baths: 2,
    sqft: "1,800",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    tag: "For Rent",
    tagColor:
      "bg-emerald-900/80 text-emerald-200 backdrop-blur-md border border-emerald-400/20",
    title: "Elegant City Apartment",
    location: "London, UK",
    price: "$4,500",
    priceSuffix: "/month",
    beds: 2,
    baths: 2,
    sqft: "1,200",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    tag: "For Sale",
    tagColor:
      "bg-emerald-950/70 text-emerald-300 backdrop-blur-md border border-emerald-500/20",
    title: "Penthouse Suite",
    location: "Singapore",
    price: "$3,400,000",
    priceSuffix: "",
    beds: 4,
    baths: 3,
    sqft: "3,100",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    tag: "For Rent",
    tagColor:
      "bg-emerald-900/80 text-emerald-200 backdrop-blur-md border border-emerald-400/20",
    title: "Seaside Residence",
    location: "Miami, USA",
    price: "$6,200",
    priceSuffix: "/month",
    beds: 3,
    baths: 2,
    sqft: "2,000",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function FeaturedProperties({
  properties = FEATURED_PROPERTIES,
}) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="properties"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-[#B78A52] mb-2">
            Featured Properties
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 tracking-tight">
            Explore Our Featured <br className="hidden sm:inline" /> Properties
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/properties")}
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0b1f3a] transition-colors cursor-pointer"
        >
          <span>View All Properties</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#dcae4d]" />
        </button>
      </div>

      {/* Property Cards Grid - Displays maximum of 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {(properties || []).slice(0, 3).map((property) => {
          const isFav = !!favorites[property.id];
          return (
            <div
              key={property.id}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />

                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-md shadow-sm ${property.tagColor || "bg-emerald-950/70 text-emerald-300"}`}
                  >
                    {property.tag}
                  </span>
                </div>

                <button
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-700 transition-all active:scale-90 shadow-sm"
                  aria-label="Add to favorites"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFav ? "fill-rose-500 text-rose-500" : "text-slate-700"
                    }`}
                  />
                </button>
              </div>

              {/* Card Details */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{property.location}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-[#0E352F] transition-colors">
                    {property.title}
                  </h3>

                  <div className="mt-3 flex items-baseline">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {property.price}
                    </span>
                    {property.priceSuffix && (
                      <span className="text-xs text-stone-500 ml-1 font-medium">
                        {property.priceSuffix}
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs */}
                <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-stone-600 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{property.beds} Beds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{property.baths} Baths</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{property.sqft} sqft</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
