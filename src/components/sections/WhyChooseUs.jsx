import React from "react";

export default function WhyChooseUs() {
  return (
    <section className="w-full mt-18 relative overflow-hidden min-h-[480px] md:min-h-[520px] flex items-center bg-[#06241e]">
      {/* 1. Full-Width Background Skyline Image */}
      <img
        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80"
        alt="City Skyline"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* 2. Signature Angled Emerald Overlay */}
      {/* Desktop: Angled polygonal cut; Mobile: Full-bleed tint */}
      <div
        className="absolute inset-0 bg-[#06241e]/95 lg:w-[58%] z-0"
        style={{
          clipPath:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? "polygon(0 0, 100% 0, 82% 100%, 0 100%)"
              : "none",
        }}
      />
      {/* Soft gradient fallback for smaller screens */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#06241e] via-[#06241e]/90 to-transparent lg:hidden z-0" />

      {/* 3. Section Content */}
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24 py-16 relative z-10">
        <div className="max-w-xl text-white">
          <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5B869] block mb-3">
            Why Choose Antixor
          </span>

          <h2 className="text-3xl md:text-5xl font-light leading-tight tracking-tight mb-4">
            More Than Just <br />
            <span className="font-semibold text-white">Properties — It's a</span> <br />
            Better Tomorrow
          </h2>

          <p className="text-xs md:text-sm text-[#94a8a3] leading-relaxed max-w-md mb-8">
            We help you find not just a property, but a place to build your
            future. With deep market knowledge and personalized service, Antixor
            makes real estate simple, secure, and stress-free.
          </p>

          <button className="bg-[#E5B869] hover:bg-[#d6a550] text-[#06241e] font-semibold text-xs px-8 py-3 rounded-full transition-all duration-200 shadow-md flex items-center gap-2">
            Learn More <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* 4. Floating Glassmorphism Stats Card */}
      <div className="absolute bottom-6 right-6 md:right-16 lg:right-24 z-20 bg-white/95 backdrop-blur-md rounded-2xl py-4 px-6 md:px-8 shadow-2xl flex items-center gap-6 md:gap-8 border border-white/60">
        <div>
          <p className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            10K+
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
            Happy Clients
          </p>
        </div>

        <div className="w-[1px] h-8 bg-slate-200" />

        <div>
          <p className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            500+
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
            Properties Listed
          </p>
        </div>

        <div className="w-[1px] h-8 bg-slate-200" />

        <div>
          <p className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            98%
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
            Satisfaction Rate
          </p>
        </div>
      </div>
    </section>
  );
}