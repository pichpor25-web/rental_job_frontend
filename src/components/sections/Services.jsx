import React from "react";
import { Home, Building2, TrendingUp, KeyRound, ArrowRight } from "lucide-react";

const SERVICES_DATA = [
  {
    id: "res-sales",
    title: "Residential Sales",
    description: "Find your perfect home with ease.",
    icon: Home,
  },
  {
    id: "comm-leasing",
    title: "Commercial Leasing",
    description: "Grow your business in the right space.",
    icon: Building2,
  },
  {
    id: "prop-investment",
    title: "Property Investment",
    description: "Build wealth with smart investments.",
    icon: TrendingUp,
  },
  {
    id: "prop-management",
    title: "Property Management",
    description: "Hassle-free management for your property.",
    icon: KeyRound,
  },
];

export default function Services() {
  return (
    <section id="services" className="max-w-7xl mt-18 mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-[#B78A52] mb-2">
            Our Services
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-slate-900 tracking-tight">
            Comprehensive Real Estate <br className="hidden sm:inline" /> Solutions
          </h2>
        </div>
        <a
          href="#view-services"
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0E352F] transition-colors"
        >
          <span>View All Services</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES_DATA.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.id}
              className="group bg-white rounded-2xl p-6 border border-stone-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-center text-slate-700 group-hover:bg-[#0E352F] group-hover:text-amber-300 transition-colors duration-300 mb-6">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{srv.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{srv.description}</p>
              </div>

              <div className="mt-8 flex justify-start">
                <button
                  className="w-8 h-8 rounded-full bg-[#082924] text-white flex items-center justify-center hover:bg-[#11443c] group-hover:scale-105 transition-all shadow-sm"
                  aria-label={`Learn more about ${srv.title}`}
                >
                  <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}