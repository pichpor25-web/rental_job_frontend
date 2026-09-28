import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  Users,
  Bed,
  Bath,
  Maximize2,
  Check,
  ShieldCheck,
  Info,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Wifi,
  Wind,
  Tv,
  Loader2,
  Home,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import { createRentalRequest } from "../../Api/rentalRequestApi";
import { fetchRoom } from "../../Api/roomApi";
import { resolveImageUrl } from "../../utils/imageHelper";
import { useAuth } from "../../context/AuthContext";

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkInDate, setCheckInDate] = useState("2026-10-15");
  const [checkOutDate, setCheckOutDate] = useState("2026-10-18");
  const [guestCount, setGuestCount] = useState(2);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    let isMounted = true;
    const loadRoom = async () => {
      try {
        setLoading(true);
        const cleanId = String(id).replace(/^room-/, "");
        const res = await fetchRoom(cleanId);
        if (isMounted && res.data) {
          const raw = res.data;
          const rawImgs = Array.isArray(raw.images) ? raw.images : [];
          const resolvedImgs = rawImgs.map(resolveImageUrl).filter(Boolean);

          setRoom({
            id: raw.id,
            numericId: raw.id,
            name: raw.name || `Room ${raw.room_number}`,
            propertyTitle:
              raw.property_title ||
              raw.property?.title ||
              raw.property?.name ||
              "Luxury Residence",
            propertyLocation:
              raw.property_location ||
              raw.property?.location ||
              "Phnom Penh, Cambodia",
            badge: raw.badge || raw.room_type || "Available",
            pricePerNight: Number(raw.price) || 0,
            sqft: raw.sqft || 35,
            guests: raw.max_guests || 2,
            bedType: raw.bed_type || "1 Queen Bed",
            bathrooms: raw.bathrooms ? `${raw.bathrooms}` : "1 Private Bath",
            images: resolvedImgs,
            description:
              raw.description ||
              "Bright and comfortable modern suite with premium amenities.",
            sleepingArrangements: [
              {
                room: "Primary Sleeping Area",
                details: `${raw.bed_type || "1 Queen Bed"} - Luxury linens`,
                icon: Bed,
              },
            ],
            specs: [
              {
                label: "Guest Capacity",
                value: `Up to ${raw.max_guests || 2} Guests`,
                icon: Users,
              },
              {
                label: "Bed Configuration",
                value: raw.bed_type || "1 Queen Bed",
                icon: Bed,
              },
              {
                label: "En-Suite Bath",
                value: raw.bathrooms ? `${raw.bathrooms}` : "1 Private Bath",
                icon: Bath,
              },
              {
                label: "Living Space",
                value: `${raw.sqft || 35} sqft`,
                icon: Maximize2,
              },
            ],
            perks: Array.isArray(raw.perks)
              ? raw.perks
              : typeof raw.perks === "string"
                ? JSON.parse(raw.perks || "[]")
                : [],
          });
        }
      } catch (err) {
        console.error("Error loading room detail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadRoom();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const nightsCount = useMemo(() => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  // Pricing specification:
  // Base Price = Nightly Rate * Nights
  // Service Fee = Base Price * 0.08 (8%)
  // Cleaning Fee = Flat $50.00
  // Total Amount = Base Price + Service Fee + Cleaning Fee
  const basePrice = (room?.pricePerNight || 0) * nightsCount;
  const serviceFee = Math.round(basePrice * 0.08 * 100) / 100;
  const cleaningFee = 0;
  const totalPrice = basePrice + serviceFee + cleaningFee;

  const handleStartReservation = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setBookingError("");
    try {
      setIsBooking(true);
      const res = await createRentalRequest({
        room_id: room.numericId || 1,
        start_date: checkInDate,
        end_date: checkOutDate,
        total_guests: guestCount,
      });
      if (!res.data?.data?.id) {
        throw new Error("Your request was not submitted. Please try again.");
      }
      setBookingConfirmed(true);
    } catch (err) {
      console.error("Unable to submit rental request:", err);
      const validationErrors = err.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;
      setBookingError(
        firstValidationError ||
          err.response?.data?.message ||
          err.message ||
          "Unable to submit your rental request. Please try again.",
      );
    } finally {
      setIsBooking(false);
    }
  };

  const nextPhoto = () => {
    if (!room?.images?.length) return;
    setActivePhotoIdx((prev) => (prev + 1) % room.images.length);
  };

  const prevPhoto = () => {
    if (!room?.images?.length) return;
    setActivePhotoIdx(
      (prev) => (prev - 1 + room.images.length) % room.images.length,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-3 text-stone-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#06241e]" />
          <p className="text-sm font-semibold tracking-wide">
            Loading suite details...
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
          <h2 className="text-2xl font-serif font-bold text-slate-900">
            Room Not Found
          </h2>
          <p className="text-xs text-stone-500">
            The room suite you are looking for does not exist in the database.
          </p>
          <button
            onClick={() => navigate("/properties")}
            className="px-6 py-2.5 rounded-full bg-[#06241e] text-[#E5B869] text-xs font-bold shadow hover:bg-[#0c3a30] transition cursor-pointer"
          >
            Back to Properties
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
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white border border-stone-200 hover:bg-stone-50 flex items-center justify-center text-slate-700 shadow-xs transition cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5B869] block">
                {room.badge}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#06241e] tracking-tight">
                {room.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Located in{" "}
                <span className="font-semibold text-slate-700">
                  {room.propertyTitle}
                </span>{" "}
                - {room.propertyLocation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2.5 rounded-full border transition flex items-center gap-1.5 text-xs font-semibold ${
                isFavorite
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-stone-200 text-slate-700 hover:bg-stone-50"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
              />
              <span className="hidden sm:inline">
                {isFavorite ? "Saved" : "Save"}
              </span>
            </button>
          </div>
        </div>

        {/* 1. INTERACTIVE HIGH-RES PHOTO CAROUSEL */}
        {room.images && room.images.length > 0 ? (
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 aspect-[16/9] max-h-[540px] shadow-2xl group">
            <img
              src={room.images[activePhotoIdx] || room.images[0]}
              alt={room.name}
              className="w-full h-full object-cover transition-all duration-700"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />

            {/* Carousel Arrows */}
            {room.images.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition shadow-lg cursor-pointer"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition shadow-lg cursor-pointer"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  {room.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activePhotoIdx === idx
                          ? "w-6 bg-[#E5B869]"
                          : "w-2 bg-white/60 hover:bg-white"
                      }`}
                      aria-label={`Photo ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute top-5 left-5 bg-[#06241e]/90 backdrop-blur-md text-[#E5B869] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#E5B869]/30 shadow-md">
              ${Number(room.pricePerNight).toFixed(2)} / Night
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[16/9] max-h-[540px] rounded-3xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
            <Home className="w-12 h-12 stroke-[1.5]" />
            <p className="text-sm font-semibold">No room photos uploaded yet</p>
          </div>
        )}

        {/* 2. MAIN GRID: SPECS & DIRECT RESERVATION DESK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Room Deep Dive */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Specs Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {room.specs.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-[#06241e]/40 transition"
                  >
                    <Icon className="w-5 h-5 text-[#E5B869]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        {item.label}
                      </p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Architectural Ambience & Design
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* Sleeping Arrangements */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Sleeping Arrangements
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {room.sleepingArrangements.map((arr, idx) => {
                  const Icon = arr.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-stone-200/90 bg-stone-50/60 flex items-start gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-[#06241e] shrink-0 shadow-xs">
                        <Icon className="w-5 h-5 text-[#E5B869]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {arr.room}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-1">
                          {arr.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Included Luxury Perks */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E5B869]" />
                <h2 className="text-lg font-bold text-slate-900 font-serif">
                  Included Luxury Perks & Privileges
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {room.perks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-semibold text-emerald-950"
                  >
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Reservation Desk */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xl space-y-5">
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-3xl font-black text-[#06241e] font-mono">
                    ${room.pricePerNight}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {" "}
                    / night
                  </span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Best Rate Direct
                </div>
              </div>

              {/* DATE PICKERS */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Check-In
                  </span>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-800 text-xs mt-1 outline-hidden"
                  />
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Check-Out
                  </span>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-transparent font-semibold text-slate-800 text-xs mt-1 outline-hidden"
                  />
                </div>
              </div>

              {/* GUEST COUNTER */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Guests
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {guestCount} Guests (Max {room.guests})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setGuestCount((prev) => Math.max(1, prev - 1))
                    }
                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-xs font-bold text-slate-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold px-1.5">{guestCount}</span>
                  <button
                    onClick={() =>
                      setGuestCount((prev) => Math.min(room.guests, prev + 1))
                    }
                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-xs font-bold text-slate-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* REAL-TIME COST CALCULATION */}
              <div className="space-y-2.5 pt-2 text-xs text-stone-600 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>
                    ${Number(room.pricePerNight).toFixed(2)} x {nightsCount}{" "}
                    {nightsCount === 1 ? "night" : "nights"}:
                  </span>
                  <span className="font-semibold text-slate-900">
                    ${basePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>VIP Concierge & Service (8%):</span>
                    <Info className="w-3 h-3 text-stone-400" />
                  </span>
                  <span className="font-semibold text-slate-900">
                    ${serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Departure Deep Sanitation:</span>
                  <span className="font-semibold text-slate-900">
                    ${cleaningFee.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold block text-slate-900">
                      Total Stay Due
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Includes all luxury fees & taxes
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#06241e] font-mono">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* DIRECT RESERVATION BUTTON */}
              {bookingError && (
                <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  {bookingError}
                </p>
              )}
              <button
                type="button"
                onClick={handleStartReservation}
                disabled={isBooking}
                className="w-full py-4 rounded-full bg-[#E5B869] hover:bg-[#d6a550] active:scale-98 text-[#06241e] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>Request to Rent</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>The owner or admin will review your request before payment.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* REQUEST SUBMITTED DIALOG */}
      {bookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-stone-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-400/30">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5B869]">
                Request Submitted
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                Your request is waiting for approval
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Your request to rent{" "}
                <strong className="text-slate-800">{room.name}</strong> from{" "}
                <strong>{checkInDate}</strong> to{" "}
                <strong>{checkOutDate}</strong> has been sent. You can pay after it is approved.
              </p>
            </div>

            <button
              onClick={() => { setBookingConfirmed(false); navigate("/my-rental-requests"); }}
              className="w-full py-3.5 rounded-full bg-[#06241e] text-[#E5B869] font-bold text-xs tracking-wider transition hover:bg-[#0d3b32]"
            >
              View Request Status
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
