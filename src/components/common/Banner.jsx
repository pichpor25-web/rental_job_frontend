import { useState } from "react";
import {
  Search,
  ChevronDown,
  ArrowRight,
  Play,
  Home,
  Users,
  ShieldCheck,
  Tag,
} from "lucide-react";

const TABS = ["Buy", "Rent", "Sell"];

const TYPES = [
  "Any Type",
  "Luxury Villa",
  "Apartment",
  "Townhouse",
  "Commercial",
];
const PRICES = [
  "$Min -$Max",
  "$100k - $500k",
  "$500k - $1M",
  "$1M - $5M",
  "$5M+",
];
const NUM_OPTIONS = ["Any", "1+", "2+", "3+", "4+", "5+"];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=85";

const HeroBanner = ({ onSearch }) => {
  const [activeTab, setActiveTab] = useState("Buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Any Type");
  const [priceRange, setPriceRange] = useState("$Min -$Max");
  const [beds, setBeds] = useState("Any");
  const [baths, setBaths] = useState("Any");

  const handleSearch = (e) => {
    e.preventDefault();
    const query = {
      mode: activeTab,
      location,
      propertyType,
      priceRange,
      beds,
      baths,
    };
    if (onSearch) onSearch(query);
    else console.log("Search Query:", query);
  };

  return (
    <section className="relative flex min-h-[680px] flex-col justify-between overflow-hidden bg-white pb-0 pt-7 text-gray-900 lg:min-h-[calc(100vh-76px)] lg:pt-9">
      {/* ---------------- Background Villa Image with Left Soft Fade ---------------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute right-0 top-0 h-[390px] w-full lg:h-[470px] lg:w-[64%]">
          <img
            src={HERO_IMAGE}
            alt="Luxury Modern Home with Pool"
            className="h-full w-full object-cover object-center"
          />
          {/* White Smooth Gradient Blur (Blends Image into Left Text Block) */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent lg:via-white/45" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-between px-5 sm:px-8 lg:px-10">
        {/* ---------------- Main Top Header Block ---------------- */}
        <div className="max-w-[520px] space-y-5 pt-3 lg:pt-5">
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-[#0b1f3a] sm:text-5xl lg:text-[56px]">
            Find Your <br />
            Perfect <span className="text-[#134074]">Home</span>
          </h1>

          <p className="max-w-md text-base font-normal leading-relaxed text-gray-600 sm:text-lg">
            Discover exceptional properties and unlock the door to your dream
            home.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button className="flex items-center space-x-2 rounded-lg bg-[#0b1f3a] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#134074] hover:shadow-lg active:scale-95">
              <span>Explore Properties</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-[#0b1f3a] shadow-sm transition-all hover:bg-gray-50 active:scale-95">
              <span>How It Works</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* ---------------- Search Filter Card ---------------- */}
        <div className="relative z-20 mt-8 lg:mt-10">
          <div className="w-full max-w-none">
            {/* Top Rounded Tab Pill Selectors (Buy / Rent / Sell) */}
            <div className="flex items-center space-x-1 pl-3">
              {TABS.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative rounded-t-xl px-6 py-2 text-xs font-bold transition-all ${
                      active
                        ? "bg-white text-[#0b1f3a] shadow-[0_-4px_12px_rgba(0,0,0,0.03)] border-t border-x border-gray-100"
                        : "bg-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] bg-[#134074] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filter Input Container */}
            <form
              onSubmit={handleSearch}
              className="rounded-2xl border border-gray-100/80 bg-white p-3 text-gray-800 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] sm:p-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                {/* Location Input */}
                <div className="lg:col-span-3 px-3 py-1 sm:border-r border-gray-100">
                  <label className="block text-[11px] font-bold text-gray-900 mb-0.5">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Neighborhood, or ZIP"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium text-gray-700 placeholder-gray-400 focus:outline-none"
                  />
                </div>

                {/* Property Type Select */}
                <div className="lg:col-span-2 px-3 py-1 sm:border-r border-gray-100 relative">
                  <label className="block text-[11px] font-bold text-gray-900 mb-0.5">
                    Property Type
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-gray-700 focus:outline-none appearance-none cursor-pointer pr-4"
                    >
                      {TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 pointer-events-none" />
                  </div>
                </div>

                {/* Price Range Select */}
                <div className="lg:col-span-2 px-3 py-1 sm:border-r border-gray-100 relative">
                  <label className="block text-[11px] font-bold text-gray-900 mb-0.5">
                    Price Range
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-gray-700 focus:outline-none appearance-none cursor-pointer pr-4"
                    >
                      {PRICES.map((price) => (
                        <option key={price} value={price}>
                          {price}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 pointer-events-none" />
                  </div>
                </div>

                {/* Beds Select */}
                <div className="lg:col-span-1 px-2 py-1 sm:border-r border-gray-100 relative">
                  <label className="block text-[11px] font-bold text-gray-900 mb-0.5">
                    Beds
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={beds}
                      onChange={(e) => setBeds(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-gray-700 focus:outline-none appearance-none cursor-pointer pr-3"
                    >
                      {NUM_OPTIONS.map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 pointer-events-none" />
                  </div>
                </div>

                {/* Baths Select */}
                <div className="lg:col-span-1 px-2 py-1 relative">
                  <label className="block text-[11px] font-bold text-gray-900 mb-0.5">
                    Baths
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={baths}
                      onChange={(e) => setBaths(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-gray-700 focus:outline-none appearance-none cursor-pointer pr-3"
                    >
                      {NUM_OPTIONS.map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-0 pointer-events-none" />
                  </div>
                </div>

                {/* Search Action Button */}
                <div className="lg:col-span-3 flex justify-end pl-2">
                  <button
                    type="submit"
                    className="w-full bg-[#0b1f3a] hover:bg-[#134074] text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <span className="text-xs">Search Properties</span>
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* ---------------- Bottom Value Proposition Row ---------------- */}
        <div className="relative z-20 -mx-5 mt-8 grid grid-cols-1 gap-5 border-t border-slate-100 bg-white px-5 py-7 sm:-mx-8 sm:grid-cols-2 sm:px-8 md:grid-cols-4 lg:-mx-10 lg:mt-8 lg:px-10">
          {/* Feature 1 */}
          <div className="flex items-start space-x-3.5">
            <div className="shrink-0 rounded-full bg-[#0b1f3a] p-3 text-white shadow-md">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0b1f3a]">
                Find The Perfect Home
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Browse thousands of verified listings that match your needs.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-full bg-[#0b1f3a] text-white shrink-0 shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0b1f3a]">
                Expert Agents
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Work with experienced agents who guide you at every step.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-full bg-[#0b1f3a] text-white shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0b1f3a]">
                Trusted & Secure
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Transparent process and secure property transactions.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-full bg-[#0b1f3a] text-white shrink-0 shadow-md">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0b1f3a]">Best Deals</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Get the best value with exclusive property deals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
