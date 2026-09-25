import React from "react";

export default function SmartInvestments() {
  return (
    <section className="w-full bg-[#071f1a] text-white py-16 md:py-24 px-6 md:px-16 lg:px-24">
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Heading & Description */}
        <div className="lg:col-span-5 flex flex-col items-start justify-center">
          <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5B869] mb-4">
            Investment Opportunities
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight mb-5">
            Smart Investments <br />
            <span className="font-semibold text-white">
              For a Brighter Future
            </span>
          </h2>

          <p className="text-xs md:text-sm text-[#8fa7a2] leading-relaxed max-w-lg mb-8">
            Explore high-return investment opportunities in prime locations
            around the world, backed by solid data and market appreciation
            trends.
          </p>

          <button className="bg-[#E5B869] hover:bg-[#d8a855] text-[#071f1a] font-semibold text-xs px-8 py-3.5 rounded-full transition-all duration-200 shadow-md flex items-center gap-2">
            Explore Investments <span>&rarr;</span>
          </button>
        </div>

        {/* Center Column: Building Image */}
        <div className="lg:col-span-5 h-[340px] md:h-[440px] w-full rounded-2xl overflow-hidden shadow-2xl border border-emerald-900/40">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
            alt="High-Rise Modern Building"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Column: Key Metrics */}
        <div className="lg:col-span-2 flex flex-row lg:flex-col justify-between lg:justify-center gap-6 lg:gap-10 border-t border-emerald-900/60 lg:border-t-0 pt-6 lg:pt-0">
          <div>
            <p className="text-3xl md:text-4xl font-light tracking-tight text-white">
              8-15<span className="text-[#E5B869] font-normal">%</span>
            </p>
            <p className="text-[10px] md:text-[11px] text-[#7d9993] uppercase tracking-wider mt-1">
              Average ROI
            </p>
          </div>

          <div className="hidden lg:block w-12 h-[1px] bg-emerald-900/60" />

          <div>
            <p className="text-3xl md:text-4xl font-light tracking-tight text-white">
              100<span className="text-[#E5B869] font-normal">+</span>
            </p>
            <p className="text-[10px] md:text-[11px] text-[#7d9993] uppercase tracking-wider mt-1">
              Global Projects
            </p>
          </div>

          <div className="hidden lg:block w-12 h-[1px] bg-emerald-900/60" />

          <div>
            <p className="text-3xl md:text-4xl font-light tracking-tight text-[#E5B869]">
              Global
            </p>
            <p className="text-[10px] md:text-[11px] text-[#7d9993] uppercase tracking-wider mt-1">
              Network
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
