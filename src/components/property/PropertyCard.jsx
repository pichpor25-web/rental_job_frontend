import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProperties } from "../../Api/propertyApi";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Search,
  SlidersHorizontal,
  Home,
  Loader2,
} from "lucide-react";

const resolveImageUrl = (img) => {
  if (!img) return null;
  const path = typeof img === "string" ? img : (img.full_url || img.image_path || img.url || "");
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `http://127.0.0.1:8000/storage/${path.replace(/^\/?(storage\/)?/, "")}`;
};

export default function AllPropertiesPage({
  properties = [],
}) {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [favorites, setFavorites] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [dbProperties, setDbProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch properties from backend API (GET /api/properties)
  useEffect(() => {
    setLoading(true);
    fetchProperties()
      .then((res) => {
        if (Array.isArray(res.data)) {
          const mapped = res.data.map((p) => {
            const primaryRoom = p.rooms?.[0];
            const rawImg =
              primaryRoom?.images?.[0]?.full_url ||
              primaryRoom?.images?.[0]?.image_path ||
              p.featured_image ||
              p.image ||
              null;
            const primaryImage = resolveImageUrl(rawImg);

            const roomPrices = (p.rooms || [])
              .map((r) => Number(r.price))
              .filter((pr) => !isNaN(pr) && pr > 0);

            const lowestPrice =
              roomPrices.length > 0
                ? Math.min(...roomPrices)
                : Number(p.price) || 0.01;

            const roomsCount = (p.rooms || []).length;
            const bathrooms = primaryRoom?.bathrooms || 1;
            const sqft = primaryRoom?.sqft || null;

            return {
              id: p.id,
              tag: "For Rent",
              tagColor:
                "bg-emerald-950/70 text-emerald-300 backdrop-blur-md border border-emerald-500/20",
              title: p.title || p.name || "Residence",
              location: p.location || p.address || "Cambodia",
              priceNumber: lowestPrice,
              price: `$${lowestPrice.toFixed(2)}`,
              priceSuffix: "/ night",
              beds:
                roomsCount > 0
                  ? `${roomsCount} ${roomsCount === 1 ? "Room" : "Rooms"}`
                  : "No rooms yet",
              baths: `${bathrooms} Bath`,
              sqft: sqft ? `${sqft} sqft` : "Spacious",
              image: primaryImage,
            };
          });
          setDbProperties(mapped);
        }
      })
      .catch((err) => {
        console.error("Error fetching properties:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter and sort all properties dynamically
  const activeDataset = dbProperties.length > 0 ? dbProperties : properties;
  const filteredProperties = useMemo(() => {
    return activeDataset
      .filter((p) => {
        const matchesTag =
          selectedTag === "All" ||
          p.tag.toLowerCase() === selectedTag.toLowerCase();
        const matchesSearch =
          (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.location || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTag && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.priceNumber - b.priceNumber;
        if (sortBy === "price-high") return b.priceNumber - a.priceNumber;
        return 0;
      });
  }, [activeDataset, selectedTag, searchQuery, sortBy]);

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
            Discover Our Portfolio
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-medium text-slate-900 tracking-tight">
            All Available Properties
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-2">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredProperties.length}
            </span>{" "}
            properties from database.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, title, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#0E352F] transition-colors"
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-stretch md:self-auto justify-center">
            {["All", "For Rent"].map((tag) => (
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

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#B78A52]" />
            <span className="text-xs font-semibold">Loading real properties...</span>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredProperties.map((property) => {
              const isFav = !!favorites[property.id];
              return (
                <div
                  key={property.id}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 flex items-center justify-center">
                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.classList.add("bg-stone-100");
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-400 gap-1.5 p-6 text-center">
                        <Home className="w-10 h-10 text-stone-300 stroke-[1.5]" />
                        <span className="text-[11px] font-medium text-stone-400">
                          Photos Coming Soon
                        </span>
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-md shadow-sm ${
                          property.tagColor || "bg-emerald-950/70 text-emerald-300"
                        }`}
                      >
                        {property.tag}
                      </span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
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
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{property.location}</span>
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
                        <span className="truncate">{property.beds}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{property.baths}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{property.sqft}</span>
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
              No properties found in database matching your filter criteria.
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
