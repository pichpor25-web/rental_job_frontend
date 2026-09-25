import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
  Loader2,
  Home,
  MapPin,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import KHQRPaymentModal from "../../components/payment/KHQRPaymentModal";
import { bookRoomStay } from "../../Api/paymentApi";
import { fetchRoom } from "../../Api/roomApi";

const resolveImageUrl = (img) => {
  if (!img) return null;
  const path = typeof img === "string" ? img : (img.full_url || img.image_path || img.url || "");
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `http://127.0.0.1:8000/storage/${path.replace(/^\/?(storage\/)?/, "")}`;
};

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkInDate, setCheckInDate] = useState("2026-10-15");
  const [checkOutDate, setCheckOutDate] = useState("2026-10-18");
  const [guestCount, setGuestCount] = useState(2);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingRentalId, setBookingRentalId] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const numericId = String(id || "1").replace(/\D/g, "") || "1";
    setLoading(true);

    fetchRoom(numericId)
      .then((res) => {
        if (res.data) {
          const r = res.data;
          const imgs = (r.images || []).map(resolveImageUrl).filter(Boolean);
          const perks = Array.isArray(r.perks)
            ? r.perks
            : (typeof r.perks === "string" ? JSON.parse(r.perks || "[]") : []);

          setRoom({
            id: r.id,
            numericId: r.id,
            name: r.name || `Room ${r.room_number}`,
            propertyTitle: r.property_title || r.property?.title || "Cambodia Residence",
            propertyLocation: r.property_location || r.property?.location || "Phnom Penh, Cambodia",
            propertyAddress: r.property_address || r.property?.address || "Phnom Penh",
            badge: r.badge || r.room_type || "Available",
            pricePerNight: Number(r.price) || 0.10,
            sqft: r.sqft || 35,
            guests: r.max_guests || 2,
            bedType: r.bed_type || "1 Queen Bed",
            bathrooms: r.bathrooms ? `${r.bathrooms} Bath` : "1 Bath",
            images: imgs,
            description: r.description || "Comfortable and modern room rental with full amenities.",
            perks: perks.length > 0 ? perks : ["High-Speed Wi-Fi", "Air Conditioning", "Private Bath"],
            specs: [
              { label: "Guest Capacity", value: `Up to ${r.max_guests || 2} Guests`, icon: Users },
              { label: "Bed Configuration", value: r.bed_type || "1 Queen Bed", icon: Bed },
              { label: "Bathrooms", value: r.bathrooms ? `${r.bathrooms} Bath` : "1 Bath", icon: Bath },
              { label: "Living Space", value: `${r.sqft || 35} sqft`, icon: Maximize2 },
            ],
            sleepingArrangements: [
              {
                room: "Master Bedroom",
                details: `${r.bed_type || "1 Queen Bed"} • Clean Linens`,
                icon: Bed,
              },
            ],
          });
        }
      })
      .catch((err) => console.error("Error loading room details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const nightsCount = useMemo(() => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  const basePrice = (room?.pricePerNight || 0.10) * nightsCount;
  const serviceFee = 0;
  const cleaningFee = 0;
  const totalPrice = basePrice;

  const handleStartReservation = async () => {
    try {
      setIsBooking(true);
      const res = await bookRoomStay({
        room_id: room.numericId || 1,
        start_date: checkInDate,
        end_date: checkOutDate,
        total_guests: guestCount,
      });

      if (res.data?.data?.id) {
        setBookingRentalId(res.data.data.id);
      }
      setShowPaymentModal(true);
    } catch (err) {
      console.warn("Backend booking fallback:", err);
      setBookingRentalId(1);
      setShowPaymentModal(true);
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
      (prev) => (prev - 1 + room.images.length) % room.images.length
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <Loader2 className="w-10 h-10 text-[#0E352F] animate-spin mb-4" />
          <p className="text-sm font-medium text-stone-500">Loading room details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <Home className="w-12 h-12 text-stone-300 stroke-[1.5] mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Room Not Found</h2>
          <p className="text-xs text-stone-500 mt-1 mb-6">
            The room you are looking for is unavailable or does not exist.
          </p>
          <button
            onClick={() => navigate("/properties")}
            className="px-6 py-2.5 rounded-full bg-[#06241e] text-emerald-200 text-xs font-semibold cursor-pointer"
          >
            Explore Properties
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B78A52] block">
                {room.badge}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#06241e] tracking-tight">
                {room.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>
                  Located in{" "}
                  <strong className="font-semibold text-slate-700">
                    {room.propertyTitle}
                  </strong>{" "}
                  • {room.propertyLocation}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2.5 rounded-full border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
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

        {/* 1. PHOTO CAROUSEL OR PLACEHOLDER */}
        {room.images.length > 0 ? (
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 aspect-[16/9] max-h-[540px] shadow-2xl group">
            <img
              src={room.images[activePhotoIdx] || room.images[0]}
              alt={room.name}
              className="w-full h-full object-cover transition-all duration-700"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />

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
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 aspect-[16/9] max-h-[400px] flex flex-col items-center justify-center text-stone-400 p-8 shadow-sm">
            <Home className="w-16 h-16 text-stone-300 stroke-[1.5] mb-2" />
            <span className="text-sm font-semibold text-stone-500">Photos Coming Soon</span>
          </div>
        )}

        {/* 2. TWO-COLUMN LAYOUT: Content & Reservation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Details */}
          <div className="lg:col-span-8 space-y-10">
            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
              {room.specs.map((spec, sIdx) => {
                const IconComponent = spec.icon;
                return (
                  <div
                    key={sIdx}
                    className="flex flex-col items-start gap-1 p-2 border-r border-stone-100 last:border-r-0"
                  >
                    <IconComponent className="w-4 h-4 text-[#B78A52]" />
                    <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                      {spec.label}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {spec.value}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-slate-900">
                About this Room
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {room.description}
              </p>
            </div>

            {/* Sleeping Arrangements */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Sleeping Arrangement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {room.sleepingArrangements.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2"
                    >
                      <Icon className="w-5 h-5 text-[#B78A52]" />
                      <h4 className="text-sm font-bold text-slate-800">
                        {item.room}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium">
                        {item.details}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities & Perks */}
            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Included Amenities & Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.perks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs"
                  >
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">
                      {perk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Reservation Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xl space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#06241e]">
                    ${room.pricePerNight.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 font-medium ml-1">
                    / night
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  Instant Confirmation
                </span>
              </div>

              {/* Dates & Guests Inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5">
                  <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                    Guests
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {[...Array(room.guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>
                    ${room.pricePerNight.toFixed(2)} × {nightsCount} {nightsCount === 1 ? "night" : "nights"}
                  </span>
                  <span className="font-semibold text-slate-800">
                    ${basePrice.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold block text-slate-900">
                      Total Stay Due
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Includes all taxes & confirmation
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#06241e] font-mono">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* DIRECT RESERVATION BUTTON */}
              <button
                type="button"
                onClick={handleStartReservation}
                disabled={isBooking}
                className="w-full py-4 rounded-full bg-[#E5B869] hover:bg-[#d6a550] active:scale-98 text-[#06241e] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>Pay & Reserve with Bakong KHQR</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant NBC Bakong Settlement & Confirmation</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BAKONG KHQR PAYMENT MODAL */}
      <KHQRPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        rentalId={bookingRentalId}
        amount={totalPrice}
        calculation={{
          nights: nightsCount,
          nightly_rate: room.pricePerNight,
          base_price: basePrice,
          service_fee: serviceFee,
          cleaning_fee: cleaningFee,
          total_amount: totalPrice,
        }}
        propertyName={room.propertyTitle}
        roomName={room.name}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          setBookingConfirmed(true);
        }}
      />

      {/* CONFIRMATION SUCCESS DIALOG */}
      {bookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-stone-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-400/30">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5B869]">
                Booking Confirmed
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                Your Stay is Secured
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Thank you! Your reservation for{" "}
                <strong className="text-slate-800">{room.name}</strong> from{" "}
                <strong>{checkInDate}</strong> to <strong>{checkOutDate}</strong>{" "}
                has been confirmed via Bakong KHQR.
              </p>
            </div>

            <button
              onClick={() => setBookingConfirmed(false)}
              className="w-full py-3.5 rounded-full bg-[#06241e] text-[#E5B869] font-bold text-xs tracking-wider transition hover:bg-[#0d3b32] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
