import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  MapPin,
  Wifi,
  Waves,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Loader2,
  Home,
  Tv,
  Car,
  Coffee,
  Wind,
  Bed,
  Bath,
  Maximize2,
  Building,
  ShieldAlert,
  Info,
  X,
  CreditCard,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { resolveImageUrl } from "../utils/imageHelper";

// Utility icon mapper for room perks
const getPerkIcon = (perkName = "") => {
  const lower = String(perkName).toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet"))
    return <Wifi className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("pool") || lower.includes("swim"))
    return <Waves className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("gym") || lower.includes("fitness"))
    return <Dumbbell className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("tv") || lower.includes("screen"))
    return <Tv className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("park") || lower.includes("garage"))
    return <Car className="w-4 h-4 text-[#B78A52]" />;
  if (
    lower.includes("coffee") ||
    lower.includes("breakfast") ||
    lower.includes("mini")
  )
    return <Coffee className="w-4 h-4 text-[#B78A52]" />;
  if (
    lower.includes("ac") ||
    lower.includes("air") ||
    lower.includes("climate")
  )
    return <Wind className="w-4 h-4 text-[#B78A52]" />;
  return <Sparkles className="w-4 h-4 text-[#B78A52]" />;
};

export default function RoomDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Component States
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reservation States
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 4);
    return today.toISOString().split("T")[0];
  });
  const [guestCount, setGuestCount] = useState(2);

  // Fetch Room Data from GET /api/rooms/{id}
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    let isMounted = true;

    const loadRoom = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/rooms/${id}`);
        if (!res.ok) throw new Error("Failed to load room");
        const data = await res.json();

        if (isMounted && data) {
          // Normalize Images
          const rawImages = Array.isArray(data.images) ? data.images : [];
          const formattedImages = rawImages
            .map((img) => {
              if (typeof img === "string") return resolveImageUrl(img);
              return resolveImageUrl(
                img?.full_url || img?.image_path || img?.url,
              );
            })
            .filter(Boolean);

          // Normalize Perks
          let parsedPerks = [];
          if (Array.isArray(data.perks)) {
            parsedPerks = data.perks;
          } else if (typeof data.perks === "string") {
            try {
              parsedPerks = JSON.parse(data.perks || "[]");
            } catch {
              parsedPerks = [];
            }
          }

          setRoom({
            ...data,
            images: formattedImages,
            perks: parsedPerks,
            price: Number(data.price) || 0,
            deposit: Number(data.deposit) || 0,
            reviews: Array.isArray(data.reviews) ? data.reviews : [],
          });

          if (data.max_guests) {
            setGuestCount(Math.min(2, Number(data.max_guests)));
          }
        }
      } catch (err) {
        console.error("Error loading room:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRoom();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Date and Billing Calculations
  const nightsCount = useMemo(() => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  const stayTotal = useMemo(() => {
    if (!room) return 0;
    return Number((room.price * nightsCount).toFixed(2));
  }, [room, nightsCount]);

  const grandTotal = useMemo(() => {
    if (!room) return 0;
    return Number((stayTotal + room.deposit).toFixed(2));
  }, [stayTotal, room]);

  const averageRating = useMemo(() => {
    if (!room?.reviews?.length) return "5.0";
    const sum = room.reviews.reduce(
      (acc, r) => acc + (Number(r.rating) || 5),
      0,
    );
    return (sum / room.reviews.length).toFixed(1);
  }, [room]);

  const isAvailable = room?.status === "available";

  const handleBookNow = () => {
    navigate(`/checkout?roomId=${room.id}`, {
      state: {
        room,
        checkInDate,
        checkOutDate,
        guestCount,
        nightsCount,
        stayTotal,
        deposit: room.deposit,
        grandTotal,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-3 text-stone-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#06241e]" />
          <p className="text-sm font-semibold tracking-wide text-slate-700">
            Loading suite experience...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 text-center space-y-4 px-4">
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Room Not Found
          </h2>
          <p className="text-xs text-stone-500">
            This suite is currently unavailable or has been archived.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-full bg-[#06241e] text-[#E5B869] text-xs font-bold tracking-wider uppercase transition shadow-md hover:bg-[#0c3a30] cursor-pointer"
          >
            Return to Property
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 font-sans selection:bg-[#E5B869]/30 selection:text-[#06241e]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* BREADCRUMB & TOP ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#B78A52]" />
            <span>Back to {room.property_title || "Property"}</span>
          </button>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                room.badge_color || "bg-[#06241e] text-[#E5B869]"
              }`}
            >
              {room.badge || room.room_type || "Suite"}
            </span>

            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available Now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                {room.status === "reserved" ? "Reserved" : "Occupied"}
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-slate-700 shadow-sm hover:bg-stone-50 transition active:scale-95 cursor-pointer"
              aria-label="Add to favorites"
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-700"}`}
              />
            </button>
          </div>
        </div>

        {/* SUITE TITLE & PARENT PROPERTY BADGE */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B78A52] tracking-wide uppercase">
            <Building className="w-4 h-4 shrink-0" />
            <span>{room.property_title || "Private Residence"}</span>
            {room.property_location && (
              <>
                <span>•</span>
                <span>{room.property_location}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-slate-900 tracking-tight">
                {room.name}
              </h1>
              {room.room_number && (
                <span className="px-3 py-1 rounded-lg bg-stone-100 text-stone-600 font-mono text-sm font-bold border border-stone-200">
                  #{room.room_number}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{averageRating}</span>
              </div>
              <span className="text-xs text-stone-400">
                ({room.reviews?.length || 0} Verified Guest Reviews)
              </span>
            </div>
          </div>
        </div>

        {/* EDITORIAL GALLERY (BENTO GRID) */}
        {room.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[380px] sm:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-stone-200">
            {/* Primary Large Image */}
            <div
              onClick={() => {
                setActivePhotoIdx(0);
                setLightboxOpen(true);
              }}
              className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-stone-900 cursor-pointer"
            >
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-4 left-4 text-xs font-semibold text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Click to inspect
              </span>
            </div>

            {/* Thumbnail Slots */}
            {room.images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActivePhotoIdx(idx + 1);
                  setLightboxOpen(true);
                }}
                className={`relative group overflow-hidden bg-stone-900 cursor-pointer ${
                  room.images.length === 2 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <img
                  src={img}
                  alt={`${room.name}-${idx}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

                {idx === 3 && room.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-sm font-bold">
                    +{room.images.length - 5} More
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-80 rounded-3xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
            <Home className="w-12 h-12 stroke-[1.5]" />
            <span className="text-sm font-medium">
              No suite photographs provided
            </span>
          </div>
        )}

        {/* MAIN TWO-COLUMN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: ROOM DETAILS, SPECS, PERKS, HOST, REVIEWS */}
          <div className="lg:col-span-8 space-y-10">
            {/* SPECS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm text-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-[#B78A52]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Occupancy
                  </span>
                  <span className="text-sm font-bold">
                    Max {room.max_guests} Guests
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-[#B78A52]">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Bed Layout
                  </span>
                  <span className="text-sm font-bold truncate">
                    {room.bed_type || "1 King Bed"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-[#B78A52]">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Bathroom
                  </span>
                  <span className="text-sm font-bold">
                    {room.bathrooms || "1 Private Bath"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-[#B78A52]">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Dimensions
                  </span>
                  <span className="text-sm font-bold">
                    {room.sqft || 500} sqft
                  </span>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-3">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                About This Suite
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                {room.description ||
                  "This luxury room suite offers curated comfort, tailored materials, and floor-to-ceiling modern furnishings designed for executive stays and restful experiences."}
              </p>
            </div>

            {/* SUITE PERKS & AMENITIES */}
            {room.perks && room.perks.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    Included Amenities
                  </h3>
                  <span className="text-xs text-stone-400 font-semibold">
                    {room.perks.length} features
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.perks.map((perk, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-xs text-xs font-semibold text-slate-700"
                    >
                      {getPerkIcon(
                        typeof perk === "string" ? perk : perk?.name,
                      )}
                      <span className="truncate">
                        {typeof perk === "string" ? perk : perk?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROPERTY & HOST INFORMATION */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                Residence & Concierge
              </h3>

              <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-[#06241e] text-[#E5B869] font-serif font-bold text-lg flex items-center justify-center ring-2 ring-[#E5B869]/40 shrink-0">
                      {(room.owner_name || "O").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {room.owner_name || "Residence Host"}
                      </h4>
                      <p className="text-xs text-stone-400">
                        Verified Luxury Host • {room.property_title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {room.owner_phone && (
                      <a
                        href={`tel:${room.owner_phone}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-bold text-slate-800 border border-stone-200 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#B78A52]" />
                        <span>{room.owner_phone}</span>
                      </a>
                    )}
                    {room.owner_email && (
                      <a
                        href={`mailto:${room.owner_email}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-bold text-slate-800 border border-stone-200 transition"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#B78A52]" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#B78A52] shrink-0" />
                    <span>
                      {room.property_address ||
                        room.property_location ||
                        "Cambodia"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B78A52] shrink-0" />
                    <span>Check-in: 3:00 PM • Check-out: 11:00 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VERIFIED GUEST REVIEWS */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    Guest Experiences
                  </h3>
                  <p className="text-xs text-stone-400">
                    Real feedback from completed reservations
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{averageRating} Rating</span>
                </div>
              </div>

              {room.reviews && room.reviews.length > 0 ? (
                <div className="space-y-3">
                  {room.reviews.map((rev, i) => (
                    <div
                      key={rev.id || i}
                      className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {rev.reviewer_name || "Verified Traveler"}
                          </span>
                          <div className="flex text-amber-500">
                            {[...Array(Number(rev.rating) || 5)].map(
                              (_, idx) => (
                                <Star
                                  key={idx}
                                  className="w-3 h-3 fill-current"
                                />
                              ),
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {rev.created_at
                            ? new Date(rev.created_at).toLocaleDateString()
                            : "Recent Stay"}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {rev.comment || rev.review}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-400 text-xs">
                  No published reviews for this suite yet. Be the first to book
                  and share your review!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RESERVATION DESK & DYNAMIC CALCULATOR */}
          <div className="lg:col-span-4 sticky top-24 space-y-5 h-fit">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xl space-y-6">
              {/* PRICE HEADER */}
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                    Starting Rate
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-[#06241e] font-mono">
                      ${room.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      / night
                    </span>
                  </div>
                </div>

                {room.available_count > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {room.available_count} units left
                  </span>
                )}
              </div>

              {/* DATES & GUEST PICKERS */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 focus-within:border-[#B78A52] transition">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 focus-within:border-[#B78A52] transition">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 flex justify-between items-center">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Guests
                    </label>
                    <span className="text-xs font-bold text-slate-800">
                      {guestCount} {guestCount === 1 ? "Adult" : "Adults"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGuestCount((p) => Math.max(1, p - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-xs font-bold text-slate-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGuestCount((p) =>
                          Math.min(room.max_guests || 6, p + 1),
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-xs font-bold text-slate-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* DYNAMIC PRICE BREAKDOWN */}
              <div className="space-y-2.5 pt-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>
                    ${room.price.toFixed(2)} × {nightsCount}{" "}
                    {nightsCount === 1 ? "night" : "nights"}
                  </span>
                  <span className="font-semibold text-slate-800">
                    ${stayTotal.toFixed(2)}
                  </span>
                </div>

                {room.deposit > 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <span>Refundable Security Deposit</span>
                      <Info className="w-3 h-3 text-stone-400" />
                    </span>
                    <span className="font-semibold text-slate-800">
                      ${room.deposit.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>VIP Guest Support</span>
                  <span className="font-semibold text-emerald-600">
                    Complimentary
                  </span>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between items-baseline text-slate-900">
                  <div>
                    <span className="text-sm font-bold block">
                      Estimated Total
                    </span>
                    <span className="text-[10px] text-stone-400">
                      All fees included
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#06241e] font-mono">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                disabled={!isAvailable}
                onClick={handleBookNow}
                className="w-full py-4 rounded-full bg-[#E5B869] hover:bg-[#d6a550] active:scale-98 text-[#06241e] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>
                  {isAvailable ? "Proceed to Checkout" : "Suite Occupied"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="space-y-1 text-center">
                <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Reservation with Instant KHQR</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FULLSCREEN LIGHTBOX FOR PHOTO INSPECTION */}
      {lightboxOpen && room.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-mono">
              {activePhotoIdx + 1} / {room.images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center py-4">
            <img
              src={room.images[activePhotoIdx]}
              alt={`Full view ${activePhotoIdx + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-xl"
            />

            {room.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((p) =>
                      p === 0 ? room.images.length - 1 : p - 1,
                    )
                  }
                  className="absolute left-2 sm:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((p) =>
                      p === room.images.length - 1 ? 0 : p + 1,
                    )
                  }
                  className="absolute right-2 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-center overflow-x-auto py-2">
            {room.images.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                  activePhotoIdx === idx
                    ? "border-[#E5B869]"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <img
                  src={thumb}
                  alt={`thumb-${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
