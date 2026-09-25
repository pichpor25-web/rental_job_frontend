import React, { useState } from "react";
import { Search, MapPin, Building, DollarSign, SlidersHorizontal, Home } from "lucide-react";

export default function AllPropertiesHeader({ totalCount = 148, onSearch }) {
  const [activeType, setActiveType] = useState("all");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ activeType, location, propertyType, priceRange });
    }
  };

  return (
    <header className="relative w-full bg-[#051f1a] text-white pt-10 pb-20 md:pb-24 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Background Architectural Watermark / Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,184,105,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[#8ea7a1] mb-4">
          <a href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home size={12} /> Home
          </a>
          <span>/</span>
          <span className="text-[#E5B869] font-semibold">Properties Directory</span>
        </div>

        {/* Page Title */}
        <span className="text-xs uppercase tracking-[0.25em] text-[#E5B869] font-medium mb-3">
          Explore Prime Real Estate
        </span>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-4">
          Find Your Next <span className="font-semibold text-white">Luxury Space</span>
        </h1>
        <p className="text-xs md:text-sm text-[#8ea7a1] max-w-2xl leading-relaxed mb-8">
          Browse through our curated collection of verified apartments, luxury penthouses, 
          and private estates across premier global metropolitan destinations.
        </p>

        {/* Quick Filter Status Badges */}
        <div className="flex items-center gap-2 mb-8 bg-emerald-950/60 p-1.5 rounded-full border border-emerald-800/40">
          {[
            { id: "all", label: "All Listings" },
            { id: "for-sale", label: "For Sale" },
            { id: "for-rent", label: "For Rent" },
            { id: "commercial", label: "Commercial" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeType === tab.id
                  ? "bg-[#E5B869] text-[#051f1a] font-semibold shadow-sm"
                  : "text-[#9cb5af] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Floating Comprehensive Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full max-w-5xl bg-white text-slate-800 rounded-2xl shadow-2xl p-3 md:p-4 border border-stone-200/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center text-left"
        >
          {/* 1. Location Input */}
          <div className="flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
            <MapPin size={16} className="text-[#051f1a] shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none cursor-pointer"
              >
                <option value="">All Global Cities</option>
                <option value="dubai">Dubai, UAE</option>
                <option value="newyork">New York, USA</option>
                <option value="london">London, UK</option>
                <option value="singapore">Singapore</option>
              </select>
            </div>
          </div>

          {/* 2. Property Type */}
          <div className="flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
            <Building size={16} className="text-[#051f1a] shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none cursor-pointer"
              >
                <option value="">Any Category</option>
                <option value="villa">Private Villa</option>
                <option value="penthouse">Sky Penthouse</option>
                <option value="apartment">Modern Apartment</option>
                <option value="office">Commercial Hub</option>
              </select>
            </div>
          </div>

          {/* 3. Price Range */}
          <div className="flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
            <DollarSign size={16} className="text-[#051f1a] shrink-0" />
            <div className="flex-1">
              <label className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                Budget
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none cursor-pointer"
              >
                <option value="">Any Price Range</option>
                <option value="under-1m">Under $1,000,000</option>
                <option value="1m-3m">$1,000,000 - $3,000,000</option>
                <option value="3m-plus">$3,000,000+</option>
              </select>
            </div>
          </div>

          {/* 4. Action Trigger */}
          <button
            type="submit"
            className="w-full h-full min-h-[46px] bg-[#E5B869] hover:bg-[#d8a855] text-[#051f1a] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <Search size={15} />
            <span>Search Properties</span>
          </button>
        </form>

        {/* Live Inventory Counter Bar */}
        <div className="mt-8 flex items-center gap-4 text-xs text-[#8ea7a1]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-white">{totalCount}</strong> Verified Available
          </span>
          <span className="text-emerald-800">•</span>
          <span>Updated Daily</span>
        </div>

      </div>
    </header>
  );
}