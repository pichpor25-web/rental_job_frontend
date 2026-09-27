import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Bed,
  Bath,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Eye,
  Home,
} from "lucide-react";

export default function RoomCard({ room, onSelect, onBookDirect }) {
  const navigate = useNavigate();
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const images =
    Array.isArray(room.images) && room.images.length > 0 ? room.images : [];
  const isAvailable = room.status ? room.status === "available" : true;

  const handlePrevImg = (e) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = () => {
    if (room?.id) {
      navigate(`/rooms/${room.id}`);
    }
    if (onSelect) {
      onSelect(room);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (room?.id) {
      navigate(`/rooms/${room.id}`);
    }
    if (onSelect) {
      onSelect(room);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer ${
        !isAvailable ? "opacity-75 bg-stone-50/60" : ""
      }`}
    >
      <div>
        {/* 1. ROOM IMAGE WITH CAROUSEL & BADGES */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          {images.length > 0 ? (
            <>
              <img
                src={images[activeImgIdx]}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

              {/* Carousel Arrows */}
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={handlePrevImg}
                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition active:scale-90"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImg}
                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition active:scale-90"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Photo Counter */}
              {images.length > 1 && (
                <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-mono text-white/90">
                  {activeImgIdx + 1} / {images.length}
                </span>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-1.5 p-6 text-center">
              <Home className="w-10 h-10 text-stone-300 stroke-[1.5]" />
              <span className="text-xs font-medium">No Suite Photos</span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                room.badgeColor || "bg-[#06241e] text-[#E5B869]"
              }`}
            >
              {room.badge || room.room_type || "Suite"}
            </span>

            {room.room_number && (
              <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold text-slate-800 shadow-sm">
                Unit #{room.room_number}
              </span>
            )}
          </div>

          {/* Status Tag */}
          <div className="absolute bottom-3.5 left-3.5">
            {isAvailable ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white backdrop-blur-md text-[10px] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {room.available_count > 1
                  ? `${room.available_count} units available`
                  : "Available now"}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white backdrop-blur-md text-[10px] font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                {room.status === "reserved" ? "Reserved" : "Booked"}
              </span>
            )}
          </div>
        </div>

        {/* 2. ROOM SPECS & DESCRIPTION */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 group-hover:text-[#06241e] transition-colors line-clamp-1">
                {room.name}
              </h3>
              <p className="text-xs text-stone-400 capitalize mt-0.5">
                {room.bed_type || room.bedType || "1 King Bed"} •{" "}
                {room.bathrooms || "1 Bath"}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-xl sm:text-2xl font-black text-[#06241e] font-mono">
                  ${Number(room.price).toFixed(2)}
                </span>
                <span className="text-[11px] text-stone-400">/ night</span>
              </div>
              {Number(room.deposit) > 0 && (
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  +${Number(room.deposit).toFixed(0)} deposit
                </span>
              )}
            </div>
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-stone-100 text-[11px] text-stone-600 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-[#B78A52] shrink-0" />
              <span className="truncate">
                Max {room.max_guests || room.guests || 2}
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Bath className="w-3.5 h-3.5 text-[#B78A52] shrink-0" />
              <span className="truncate">{room.bathrooms || "1 Bath"}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Maximize2 className="w-3.5 h-3.5 text-[#B78A52] shrink-0" />
              <span className="truncate">{room.sqft || 35} sqft</span>
            </div>
          </div>

          {/* Perks / Amenities Pills */}
          {Array.isArray(room.perks) && room.perks.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {room.perks.slice(0, 3).map((perk, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200/80 text-[10px] font-medium text-stone-600"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#B78A52]" />
                  <span>{typeof perk === "string" ? perk : perk?.name}</span>
                </span>
              ))}
              {room.perks.length > 3 && (
                <span className="text-[10px] text-stone-400 self-center pl-1 font-medium">
                  +{room.perks.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. DUAL ACTION BUTTONS (VIEW DETAILS vs CHOOSE & PAY) */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 grid grid-cols-2 gap-2 border-t border-stone-100 bg-stone-50/40">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/rooms/${room.id}`);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-stone-500" />
          <span>View Details</span>
        </button>

        <button
          type="button"
          disabled={!isAvailable}
          onClick={(e) => {
            e.stopPropagation();
            if (onBookDirect) {
              onBookDirect(room.id);
            } else if (room?.id) {
              navigate(`/rooms/${room.id}`);
            } else if (onSelect) {
              onSelect(room);
            }
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#06241e] hover:bg-[#0c3a30] text-[#E5B869] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Choose & Pay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
