import React from "react";

const locations = [
  {
    name: "Dubai",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "London",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "New York",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Singapore",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80",
  },
];

export default function PopularLocations() {
  return (
    <section className="bg-[#FBFBFA] py-16 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-light text-slate-900">
            Popular <span className="font-semibold">Locations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore prime real estate across the world's best cities.
          </p>
        </div>
        <a
          href="#locations"
          className="text-xs text-slate-500 hover:text-slate-800 transition"
        >
          View All Locations &rarr;
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {locations.map((loc, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl overflow-hidden h-90 shadow-sm cursor-pointer"
          >
            <img
              src={loc.image}
              alt={loc.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute bottom-4 left-4 text-white text-sm font-semibold tracking-wide">
              {loc.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
