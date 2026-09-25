import React, { useState, useMemo, useEffect } from "react";
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
  Check,
  Phone,
  MessageSquare,
  Info,
  Clock,
  Sparkle,
  Loader2,
  Home,
} from "lucide-react";
import RoomCard from "../components/Rooms/RoomCard";
import Footer from "../components/common/Footer";
import BakongPaymentModal from "../components/payment/BakongPaymentModal";
import { bookRoomStay } from "../Api/paymentApi";
import { fetchProperty } from "../Api/propertyApi";
import Navbar from "../components/common/Navbar";

const resolveImageUrl = (img) => {
  if (!img) return null;
  const path = typeof img === "string" ? img : (img.full_url || img.image_path || img.url || "");
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `http://127.0.0.1:8000/storage/${path.replace(/^\/?(storage\/)?/, "")}`;
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Declarations
  const [propertyData, setPropertyData] = useState(null);
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [checkInDate, setCheckInDate] = useState("2026-10-15");
  const [checkOutDate, setCheckOutDate] = useState("2026-10-19");
  const [guestCount, setGuestCount] = useState(2);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmedPayment, setConfirmedPayment] = useState(null);
  const [bookingRentalId, setBookingRentalId] = useState(null);

  // Fetch real Property and Rooms from backend API (GET /api/properties/{id})
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    let isMounted = true;
    const loadProperty = async () => {
      try {
        setLoading(true);
        const propId = Number(id) || 1;
        const res = await fetchProperty(propId);
        if (isMounted && res.data) {
          setPropertyData(res.data);
          if (Array.isArray(res.data.rooms) && res.data.rooms.length > 0) {
            const formatted = res.data.rooms.map((rm) => {
              const imgs = (rm.images || []).map(resolveImageUrl).filter(Boolean);
              const perks = Array.isArray(rm.perks)
                ? rm.perks
                : (typeof rm.perks === "string" ? JSON.parse(rm.perks || "[]") : []);

              return {
                id: rm.id,
                name: rm.name || `Room ${rm.room_number}`,
                badge: rm.badge || rm.room_type || "Available",
                badgeColor: rm.badge_color || "bg-[#E5B869] text-[#06241e]",
                images: imgs,
                pricePerNight: Number(rm.price) || 0.10,
                sqft: rm.sqft || 35,
                guests: rm.max_guests || 2,
                bedType: rm.bed_type || "1 Queen Bed",
                bathrooms: rm.bathrooms ? `${rm.bathrooms} Bath` : "1 Bath",
                perks: perks.length > 0 ? perks : ["Air Conditioning", "High-Speed Wi-Fi", "Private Bath"],
                availableCount: rm.available_count || 1,
                description: rm.description || "Comfortable and modern room.",
              };
            });
            setRoomsList(formatted);
            setSelectedRoomId(formatted[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading property:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProperty();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Gallery images compiled from real room photos
  const activeGallery = useMemo(() => {
    const list = [];
    if (roomsList.length > 0) {
      roomsList.forEach((rm, rmIdx) => {
        (rm.images || []).forEach((img, imgIdx) => {
          list.push({
            id: `${rmIdx}-${imgIdx}`,
            title: rm.name,
            url: img,
            tag: rm.badge || "Suites",
          });
        });
      });
    }
    const propCover = resolveImageUrl(propertyData?.featured_image || propertyData?.image);
    if (propCover) {
      list.unshift({
        id: "cover",
        title: propertyData.title || propertyData.name,
        url: propCover,
        tag: "Exterior",
      });
    }
    return list;
  }, [roomsList, propertyData]);

  // Selected Room
  const selectedRoom = useMemo(() => {
    return (
      roomsList.find((r) => String(r.id) === String(selectedRoomId)) ||
      roomsList[0] || {
        id: 1,
        name: "Standard Room",
        pricePerNight: 0.10,
      }
    );
  }, [roomsList, selectedRoomId]);

  // Stay duration and costs
  const nightsCount = useMemo(() => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  // Test payment rate: exact $0.01 total
  const basePrice = 0.01;
  const serviceFee = 0;
  const cleaningFee = 0;
  const totalPrice = 0.01;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-3 text-stone-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#06241e]" />
          <p className="text-sm font-semibold tracking-wide">Loading luxury residence...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 text-center space-y-4 px-4">
          <h2 className="text-2xl font-serif font-bold text-slate-900">Property Not Found</h2>
          <p className="text-xs text-stone-500">The property you are looking for does not exist in the database.</p>
          <button
            onClick={() => navigate("/properties")}
            className="px-6 py-2.5 rounded-full bg-[#06241e] text-[#E5B869] text-xs font-bold shadow hover:bg-[#0c3a30] transition"
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
        {/* 2. PROPERTY HEADLINE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#06241e] text-[#E5B869] border border-[#E5B869]/30">
                Super Luxury Residence
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>4.98</span>
                <span className="text-stone-400 font-normal">(Verified Reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-serif font-medium text-slate-900 tracking-tight">
              {propertyData.title || propertyData.name}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mt-2">
              <MapPin className="w-4 h-4 text-[#B78A52] shrink-0" />
              <span>{propertyData.location || propertyData.address}</span>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Rates starting from
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#06241e] tracking-tight">
                $0.01
              </span>
              <span className="text-xs text-stone-500 font-medium">/ night</span>
            </div>
          </div>
        </div>

        {/* 3. HERO GALLERY */}
        {activeGallery.length > 0 && (
          <div className="space-y-4">
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-200">
              <img
                src={activeGallery[activePhotoIdx]?.url || activeGallery[0]?.url}
                alt={activeGallery[activePhotoIdx]?.title}
                className="w-full h-full object-cover transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute top-5 left-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-800 transition-all shadow-md active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute top-5 right-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-800 transition-all shadow-md active:scale-95"
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-800"}`}
                  />
                </button>
              </div>

              {activeGallery.length > 1 && (
                <div className="absolute bottom-5 right-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((prev) =>
                        prev === 0 ? activeGallery.length - 1 : prev - 1
                      )
                    }
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition active:scale-90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-white/90 font-mono bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                    {activePhotoIdx + 1} / {activeGallery.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((prev) =>
                        prev === activeGallery.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {activeGallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {activeGallery.map((item, idx) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-24 sm:w-32 aspect-[4/3] rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? "border-[#E5B869] ring-2 ring-[#E5B869]/30 scale-98"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. MAIN TWO-COLUMN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN: Overview & Room Selection */}
          <div className="lg:col-span-8 space-y-10">
            {/* AVAILABLE ROOMS SECTION */}
            <div className="space-y-6" id="suites">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200/80 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-widest font-bold text-[#B78A52] block mb-1">
                    Suites & Configurations
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                    Select Your Room Stay
                  </h2>
                </div>
                <div className="text-xs text-stone-500 font-semibold bg-stone-100 px-3.5 py-1.5 rounded-full w-fit">
                  {roomsList.length} room suites ready
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                Click any suite below to configure dates and initiate instant Bakong KHQR checkout.
              </p>

              {/* RENDER MODULAR ROOMCARD COMPONENTS */}
              <div className="space-y-5">
                {roomsList.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isSelected={String(selectedRoomId) === String(room.id)}
                    onSelect={(rid) => setSelectedRoomId(rid)}
                  />
                ))}
              </div>
            </div>

            {/* TABBED DETAILS */}
            <div className="space-y-6 pt-4 border-t border-stone-200">
              <div className="flex gap-2 border-b border-stone-200 pb-2">
                {[
                  { id: "overview", label: "Property Overview" },
                  { id: "rules", label: "House Rules" },
                  { id: "host", label: "Private Host" },
                ].map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#06241e] text-[#E5B869]"
                        : "text-stone-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div className="prose prose-stone text-xs leading-relaxed text-stone-600 space-y-3">
                  <p>{propertyData.description || "Ultra-luxurious residential villa featuring infinity private pool and beachfront views."}</p>
                  <p>Each suite is furnished with bespoke amenities, intelligent climate controls, and high-speed Wi-Fi connectivity.</p>
                </div>
              )}

              {activeTab === "rules" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <Clock className="w-4 h-4 text-[#B78A52] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Check-in / Check-out</strong>
                      <span>Check-in: 3:00 PM | Check-out: 11:00 AM</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <ShieldCheck className="w-4 h-4 text-[#B78A52] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Verification</strong>
                      <span>Passport or National ID required upon arrival.</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "host" && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#06241e] text-[#E5B869] font-bold flex items-center justify-center ring-2 ring-[#E5B869]">
                      PP
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {propertyData.owner_name || "POR PECH"}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Verified Luxury Host • Direct: {propertyData.owner_phone || "005 381 524"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-slate-800 hover:bg-stone-100">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{propertyData.owner_phone || "005 381 524"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY RESERVATION DESK */}
          <div className="lg:col-span-4 sticky top-24 space-y-6" id="book-now">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                    Selected Configuration
                  </span>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {selectedRoom.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#06241e] font-mono">
                    $0.01
                  </span>
                  <span className="text-[10px] text-stone-400 block">/ night test</span>
                </div>
              </div>

              {/* DATE PICKERS */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex justify-between items-center">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                      Guests
                    </label>
                    <span className="text-xs font-semibold text-slate-800">
                      {guestCount} Adults
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuestCount((p) => Math.max(1, p - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-xs font-bold text-slate-700 hover:bg-stone-100 flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuestCount((p) => Math.min(6, p + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-xs font-bold text-slate-700 hover:bg-stone-100 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="space-y-2.5 pt-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Test Stay Rate ({nightsCount} nights)</span>
                  <span className="font-semibold text-slate-800">$0.01</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <span>VIP Concierge & Service (Test Promo)</span>
                    <Info className="w-3 h-3 text-stone-400" />
                  </span>
                  <span className="font-semibold text-emerald-600">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Departure Deep Sanitation (Test Promo)</span>
                  <span className="font-semibold text-emerald-600">$0.00</span>
                </div>

                <div className="border-t border-stone-100 pt-3 flex justify-between items-baseline text-slate-900">
                  <div>
                    <span className="text-sm font-bold block">Estimated Total</span>
                    <span className="text-[10px] text-stone-400">Test payment rate for Bakong KHQR</span>
                  </div>
                  <span className="text-2xl font-extrabold text-[#06241e]">$0.01</span>
                </div>
              </div>

              {/* SUBMIT BUTTON WITH BACKEND BOOKING */}
              <button
                type="button"
                disabled={isBooking}
                onClick={async () => {
                  try {
                    setIsBooking(true);
                    const roomId = typeof selectedRoom.id === "number" ? selectedRoom.id : 1;
                    const res = await bookRoomStay({
                      room_id: roomId,
                      start_date: checkInDate,
                      end_date: checkOutDate,
                      total_guests: guestCount,
                      guest_name: "POR PECH",
                      guest_phone: "005381524",
                    });
                    if (res.data?.data?.id) {
                      setBookingRentalId(res.data.data.id);
                    }
                  } catch (e) {
                    console.warn("Direct booking offline fallback:", e?.message);
                  } finally {
                    setIsBooking(false);
                    setShowPaymentModal(true);
                  }
                }}
                className="w-full py-4 rounded-full bg-[#E5B869] hover:bg-[#d6a550] active:scale-98 text-[#06241e] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                <span>{isBooking ? "Securing Reservation..." : "Pay & Reserve with KHQR"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Antixor Best Rate Guarantee & Secure Checkout</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 6. MODAL: BOOKING CONFIRMATION */}
      {showBookingSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-stone-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#06241e] flex items-center justify-center mx-auto border-2 border-emerald-500/20">
              <Check className="w-8 h-8 text-emerald-600 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B78A52]">
                Reservation Initiated
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                Stay Reserved at Antixor
              </h3>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                Thank you! Your booking for <strong className="text-slate-800">{selectedRoom.name}</strong> from{" "}
                <strong>{checkInDate}</strong> to <strong>{checkOutDate}</strong> has been secured.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl text-left text-xs space-y-2 border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-400">Total Paid:</span>
                <span className="font-bold text-slate-900">{confirmedPayment?.amount || `$${totalPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Payment Method:</span>
                <span className="font-bold text-slate-800">{confirmedPayment?.method || "Bakong KHQR (ABA Bank)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Merchant Payee:</span>
                <span className="font-bold text-slate-800">POR PECH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Transaction Ref:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {confirmedPayment?.transactionCode || "KHQR-89240"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowBookingSuccessModal(false)}
              className="w-full py-3 rounded-full bg-[#06241e] text-[#E5B869] font-bold text-xs tracking-wider transition-all hover:bg-[#0c3a30]"
            >
              Close Confirmation
            </button>
          </div>
        </div>
      )}

      {/* KHQR PAYMENT MODAL */}
      <BakongPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        rentalId={bookingRentalId}
        amount={totalPrice}
        propertyName={propertyData?.title || propertyData?.name || "Luxury Residence"}
        roomName={selectedRoom.name}
        onPaymentSuccess={(paymentInfo) => {
          setConfirmedPayment(paymentInfo);
          setShowPaymentModal(false);
          setShowBookingSuccessModal(true);
        }}
      />

      <Footer />
    </div>
  );
}
