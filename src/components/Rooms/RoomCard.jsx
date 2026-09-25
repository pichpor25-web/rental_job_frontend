import React from 'react';
import {
  Users,
  Bed,
  Bath,
  Maximize2,
  Check,
  ChevronRight,
  Home
} from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageHelper';

export default function RoomCard({ room, isSelected, onSelect }) {
  const rawImg = Array.isArray(room.images) && room.images.length > 0 ? room.images[0] : null;
  const imageSrc = resolveImageUrl(rawImg);

  return (
    <div
      onClick={() => onSelect(room.id)}
      className={`relative bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl ${
        isSelected
          ? 'border-[#06241e] ring-2 ring-[#06241e]/10 bg-gradient-to-br from-white via-white to-emerald-50/20'
          : 'border-stone-200/80 hover:border-stone-300'
      }`}
    >
      {/* Active Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 bg-[#06241e] text-[#E5B869] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <Check className="w-3.5 h-3.5" />
          <span>Selected Stay</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Room Preview Image */}
        <div className="md:col-span-4 relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 group flex items-center justify-center">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={room.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-400 gap-1.5 p-4 text-center">
              <Home className="w-8 h-8 text-stone-300 stroke-[1.5]" />
              <span className="text-[11px] font-medium text-stone-400">No Image</span>
            </div>
          )}
          <span className={`absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs ${room.badgeColor}`}>
            {room.badge}
          </span>
        </div>

        {/* Room Details */}
        <div className="md:col-span-8 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center justify-between pr-24">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-[#06241e] transition-colors">
                {room.name}
              </h3>
            </div>
            <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Quick Spec Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-600 font-medium">
            <div className="flex items-center gap-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
              <Users className="w-3.5 h-3.5 text-[#B78A52]" />
              <span>{room.guests} Guests</span>
            </div>
            <div className="flex items-center gap-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
              <Bed className="w-3.5 h-3.5 text-[#B78A52]" />
              <span className="truncate">{room.bedType}</span>
            </div>
            <div className="flex items-center gap-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
              <Bath className="w-3.5 h-3.5 text-[#B78A52]" />
              <span className="truncate">{room.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
              <Maximize2 className="w-3.5 h-3.5 text-[#B78A52]" />
              <span>{room.sqft} sqft</span>
            </div>
          </div>

          {/* Included Perks Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.perks.map((perk, pIdx) => (
              <span
                key={pIdx}
                className="text-[10px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md"
              >
                ✓ {perk}
              </span>
            ))}
          </div>

          {/* Price & Selection Button Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                ${room.pricePerNight}
              </span>
              <span className="text-xs text-stone-500 font-medium"> / night</span>
              <span className="block text-[10px] text-emerald-700 font-semibold">
                Instant confirmation • Free cancellation
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(room.id);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#06241e] text-[#E5B869]'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
              }`}
            >
              <span>{isSelected ? 'Room Selected' : 'Choose This Room'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}