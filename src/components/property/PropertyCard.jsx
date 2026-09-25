import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

// Mock dataset for viewing all properties
const ALL_PROPERTIES_DATA = [
  {
    id: 1,
    tag: "For Sale",
    tagColor:
      "bg-emerald-950/70 text-emerald-300 backdrop-blur-md border border-emerald-500/20",
    title: "Luxury Villa with Private Pool",
    location: "Dubai, UAE",
    priceNumber: 2850000,
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
    priceNumber: 1250000,
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
    priceNumber: 4500,
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
    title: "Seaside Penthouse & Deck",
    location: "Miami, USA",
    priceNumber: 3450000,
    price: "$3,450,000",
    priceSuffix: "",
    beds: 4,
    baths: 3,
    sqft: "3,800",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    tag: "For Rent",
    tagColor:
      "bg-emerald-900/80 text-emerald-200 backdrop-blur-md border border-emerald-400/20",
    title: "Minimalist Loft Residence",
    location: "Berlin, Germany",
    priceNumber: 2900,
    price: "$2,900",
    priceSuffix: "/month",
    beds: 1,
    baths: 1,
    sqft: "950",
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 6,
    tag: "For Sale",
    tagColor:
      "bg-emerald-950/70 text-emerald-300 backdrop-blur-md border border-emerald-500/20",
    title: "Contemporary Hillside Retreat",
    location: "Los Angeles, USA",
    priceNumber: 4200000,
    price: "$4,200,000",
    priceSuffix: "",
    beds: 5,
    baths: 5,
    sqft: "5,400",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function AllPropertiesPage({
  properties = ALL_PROPERTIES_DATA,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const [favorites, setFavorites] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter and sort all properties dynamically
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        const matchesTag =
          selectedTag === "All" ||
          p.tag.toLowerCase() === selectedTag.toLowerCase();
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTag && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.priceNumber - b.priceNumber;
        if (sortBy === "price-high") return b.priceNumber - a.priceNumber;
        return 0;
      });
  }, [properties, selectedTag, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Page Title & Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-[#B78A52]">All Properties</span>
          </div>

          <p className="text-xs uppercase tracking-widest font-semibold text-[#B78A52] mb-1.5">
            Discover Our Entire Portfolio
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-medium text-slate-900 tracking-tight">
            All Available Properties
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-2">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredProperties.length}
            </span>{" "}
            properties matching your preferences.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, title, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#0E352F] transition-colors"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-stretch md:self-auto justify-center">
            {["All", "For Sale", "For Rent"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTag === tag
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-stone-500 hover:text-slate-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <SlidersHorizontal size={14} className="text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-stone-600 font-medium outline-none cursor-pointer"
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Properties Grid (All items rendered) */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredProperties.map((property) => {
              const isFav = !!favorites[property.id];
              return (
                <div
                  key={property.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-md shadow-sm ${property.tagColor || "bg-emerald-950/70 text-emerald-300"}`}
                      >
                        {property.tag}
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-700 transition-all active:scale-90 shadow-sm"
                      aria-label="Add to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav
                            ? "fill-rose-500 text-rose-500"
                            : "text-slate-700"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Property Details */}
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

                    {/* Specifications */}
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
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
            <p className="text-stone-400 text-sm">
              No properties found matching your filter criteria.
            </p>
            <button
              onClick={() => {
                setSelectedTag("All");
                setSearchQuery("");
              }}
              className="mt-3 text-xs font-semibold text-[#0E352F] underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
