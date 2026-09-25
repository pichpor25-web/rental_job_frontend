import React from "react";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Sarah Johnson",
    role: "Property Buyer, UAE",
    review:
      "Antixor made the entire process smooth and stress-free. Their team is professional, responsive, and truly cares about their clients.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "James Miller",
    role: "Real Estate Investor",
    review:
      "Investment is a breeze with Antixor and I couldn't be happier. Great service, excellent guidance, and top-notch portfolio.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Fatima Al-Nasser",
    role: "Apartment Owner, NYC",
    review:
      "From finding the right property to closing the deal, Antixor was with me every step of the way. Highly recommended!",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#FBFBFA] py-16 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-light text-slate-900">
            What Our <span className="font-semibold">Clients Say</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real stories from real people who found their dream properties with
            Antixor.
          </p>
        </div>
        <a
          href="#reviews"
          className="text-xs text-slate-500 hover:text-slate-800 transition"
        >
          View All Reviews &rarr;
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <p className="text-xs text-slate-600 italic leading-relaxed mb-6">
              "{r.review}"
            </p>
            <div className="flex items-center gap-3">
              <img
                src={r.avatar}
                alt={r.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-xs text-slate-900">
                  {r.name}
                </h4>
                <p className="text-[10px] text-slate-400">{r.role}</p>
                <div className="flex text-[#E5B869] gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
