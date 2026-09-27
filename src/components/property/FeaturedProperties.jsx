import React, { useState, useEffect } from "react";
import { fetchProperties } from "../../Api/propertyApi";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, ArrowRight, Loader2, Home } from "lucide-react";
import { resolveImageUrl } from "../../utils/imageHelper";

export default function FeaturedProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync favorites with localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("property_favorites");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let isMounted = true;

    fetchProperties()
      .then((res) => {
        if (!isMounted) return;

        // Ensure support whether res is directly an array or inside res.data
        const rawData = Array.isArray(res) ? res : res?.data;

        if (Array.isArray(rawData)) {
          const mapped = rawData.map((p) => {
            const primaryRoom = p.rooms?.[0];

            // 1. Resolve Image from Backend structure
            const rawImg =
              p.featured_image ||
              p.gallery?.[0]?.url ||
              primaryRoom?.images?.[0]?.full_url ||
              primaryRoom?.images?.[0]?.image_path ||
              null;
            const primaryImage = resolveImageUrl(rawImg);

            // 2. Resolve Price & Suffix
            const roomPrices = (p.rooms || [])
              .map((r) => Number(r.price))
              .filter((pr) => !isNaN(pr) && pr > 0);

            const numericPrice =
              roomPrices.length > 0
                ? Math.min(...roomPrices)
                : Number(p.price) || 0;

            const displayPrice =
              p.price_display ||
              (numericPrice > 0 ? `$${numericPrice.toFixed(2)}` : "Contact Us");

            const priceSuffix = p.price_suffix || (numericPrice > 0 ? "/ night" : "");

            // 3. Resolve Beds, Baths & Sqft (prioritize property level, fallback to room)
            const bedsCount =
              p.beds !== null && p.beds !== undefined
                ? Number(p.beds)
                : (p.rooms || []).length;

            const bathsCount =
              p.baths !== null && p.baths !== undefined
                ? Number(p.baths)
                : Number(primaryRoom?.bathrooms) || 1;

            const sqftDisplay = p.sqft || primaryRoom?.sqft || null;

            return {
              id: p.id,
              tag: p.tag || "For Rent",
              tagColor:
                p.tag_color ||
                "bg-emerald-950/70 text-emerald-300 backdrop-blur-md border border-emerald-500/20",
              title: p.title || p.name || "Residence",
              location: p.location || p.address || "Cambodia",
              price: displayPrice,
              priceSuffix: priceSuffix,
              beds:
                bedsCount > 0
                  ? `${bedsCount} ${bedsCount === 1 ? "Bed" : "Beds"}`
                  : "Studio",
              baths: `${bathsCount} ${bathsCount === 1 ? "Bath" : "Baths"}`,
              sqft: sqftDisplay ? `${sqftDisplay} sqft` : "Spacious",
              image: primaryImage,
            };
          });

          setProperties(mapped);
        }
      })
      .catch((err) => console.error("Error fetching featured properties:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("property_favorites", JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save favorites to localStorage", err);
      }
      return next;
    });
  };

  return (
    <section
      id="properties"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14"
    >
      {/* Section Header */}
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

      {/* Loading & Empty States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-stone-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#B78A52]" />
          <span className="text-xs font-medium">Loading properties from database...</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-stone-200/80 text-stone-500">
          <p className="text-sm font-medium">No properties found in database.</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {properties.slice(0, 3).map((property) => {
            const isFav = !!favorites[property.id];

            return (
              <div
                key={property.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/properties/${property.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/properties/${property.id}`);
                  }
                }}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B78A52]/40"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 flex items-center justify-center">
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.classList.add("bg-stone-100");
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

                  {/* Status / Tag Badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-md shadow-sm ${property.tagColor}`}
                    >
                      {property.tag}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(property.id);
                    }}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-700 transition-all active:scale-90 shadow-sm cursor-pointer"
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
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
                        <span className="text-xs text-stone-500 font-medium ml-1">
                          {property.priceSuffix}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amenities / Property Specs */}
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="truncate">{property.beds}</span>
                    <span>•</span>
                    <span className="truncate">{property.baths}</span>
                    <span>•</span>
                    <span className="truncate">{property.sqft}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}