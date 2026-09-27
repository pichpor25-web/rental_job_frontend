import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Wifi,
  Waves,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronLeft,
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
  Users,
  X,
  CheckCircle2,
} from "lucide-react";
import RoomCard from "../components/room/RoomCard";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";
import { fetchProperty } from "../Api/propertyApi";
import { resolveImageUrl } from "../utils/imageHelper";

// Utility icon matcher for property amenities
const getAmenityIcon = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("pool") || lower.includes("swim")) return <Waves className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("gym") || lower.includes("fitness")) return <Dumbbell className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("tv") || lower.includes("cable")) return <Tv className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("park") || lower.includes("garage")) return <Car className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("coffee") || lower.includes("breakfast")) return <Coffee className="w-4 h-4 text-[#B78A52]" />;
  if (lower.includes("ac") || lower.includes("air") || lower.includes("climate")) return <Wind className="w-4 h-4 text-[#B78A52]" />;
  return <Sparkles className="w-4 h-4 text-[#B78A52]" />;
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core State
  const [propertyData, setPropertyData] = useState(null);
  const [roomsList, setRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Selected Room for the Detailed Modal View
  const [activeRoomModal, setActiveRoomModal] = useState(null);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);

  // Fetch Property Data
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    let isMounted = true;

    const loadProperty = async () => {
      try {
        setLoading(true);
        const propId = Number(id) || 1;
        const res = await fetchProperty(propId);
        const data = res?.data || res;

        if (isMounted && data) {
          setPropertyData(data);

          if (Array.isArray(data.rooms) && data.rooms.length > 0) {
            const formatted = data.rooms.map((rm) => {
              const rawImages = Array.isArray(rm.images) ? rm.images : [];
              const roomImgs = rawImages
                .map((img) => {
                  if (typeof img === "string") return resolveImageUrl(img);
                  return resolveImageUrl(img?.full_url || img?.image_path || img?.url);
                })
                .filter(Boolean);

              let perksList = [];
              if (Array.isArray(rm.perks)) {
                perksList = rm.perks;
              } else if (typeof rm.perks === "string") {
                try {
                  perksList = JSON.parse(rm.perks || "[]");
                } catch {
                  perksList = [];
                }
              }

              return {
                id: rm.id,
                name: rm.name || `Room ${rm.room_number || rm.id}`,
                room_number: rm.room_number || null,
                room_type: rm.room_type || "Suite",
                badge: rm.badge || rm.room_type || "Available",
                badgeColor: rm.badge_color || "bg-[#E5B869] text-[#06241e]",
                price: Number(rm.price) || 0.1,
                deposit: Number(rm.deposit) || 0.0,
                max_guests: Number(rm.max_guests) || 2,
                bed_type: rm.bed_type || "1 King Bed",
                bathrooms: rm.bathrooms || "1 Private Bath",
                sqft: Number(rm.sqft) || 500,
                perks: perksList,
                available_count: Number(rm.available_count) || 1,
                status: rm.status || "available",
                description: rm.description || "",
                images: roomImgs,
                reviews: Array.isArray(rm.reviews) ? rm.reviews : [],
              };
            });
            setRoomsList(formatted);
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

  // Aggregate Reviews
  const allReviews = useMemo(() => {
    if (!roomsList.length) return [];
    return roomsList.flatMap((r) => r.reviews || []);
  }, [roomsList]);

  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return "5.00";
    const sum = allReviews.reduce((acc, rev) => acc + (Number(rev.rating) || 5), 0);
    return (sum / allReviews.length).toFixed(2);
  }, [allReviews]);

  // Compiled Gallery
  const activeGallery = useMemo(() => {
    const list = [];
    const propCover = resolveImageUrl(propertyData?.featured_image || propertyData?.image);
    if (propCover) {
      list.push({
        id: "cover",
        title: propertyData?.title || propertyData?.name || "Featured View",
        url: propCover,
        tag: propertyData?.tag || "Property",
      });
    }

    if (Array.isArray(propertyData?.gallery)) {
      propertyData.gallery.forEach((g, idx) => {
        const url = resolveImageUrl(g.url || g.image_path || g);
        if (url && !list.some((item) => item.url === url)) {
          list.push({
            id: `gallery-${g.id || idx}`,
            title: g.title || `Gallery Photo ${idx + 1}`,
            url,
            tag: g.tag || "Gallery",
          });
        }
      });
    }

    return list;
  }, [propertyData]);

  // Amenities Parser
  const parsedAmenities = useMemo(() => {
    if (!propertyData?.amenities) return [];
    if (Array.isArray(propertyData.amenities)) return propertyData.amenities;
    if (typeof propertyData.amenities === "string") {
      try {
        return JSON.parse(propertyData.amenities);
      } catch {
        return [];
      }
    }
    return [];
  }, [propertyData]);

  // Navigate to Room Detail Page
  const handleOpenRoomDetail = (room) => {
    if (room?.id) {
      navigate(`/rooms/${room.id}`);
    }
  };

  // Direct to booking / payment route
  const handleProceedToPayment = (roomId) => {
    navigate(`/booking/checkout?propertyId=${propertyData.id}&roomId=${roomId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-3 text-stone-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#06241e]" />
          <p className="text-sm font-semibold tracking-wide">Loading residence details...</p>
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
        {/* 1. HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                  propertyData.tag_color || "bg-[#06241e] text-[#E5B869] border-[#E5B869]/30"
                }`}
              >
                {propertyData.tag || "Super Luxury Residence"}
              </span>

              <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{averageRating}</span>
                <span className="text-stone-400 font-normal">
                  ({allReviews.length > 0 ? `${allReviews.length} Verified Reviews` : "New Listing"})
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-serif font-medium text-slate-900 tracking-tight">
              {propertyData.title || propertyData.name}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mt-2">
              <MapPin className="w-4 h-4 text-[#B78A52] shrink-0" />
              <span>{propertyData.location || propertyData.address || "Cambodia"}</span>
            </div>
          </div>

          <div className="flex flex-col md:items-end">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Rooms Starting From
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#06241e] tracking-tight">
                {propertyData.price_display || `$${Number(propertyData.price || 0).toFixed(2)}`}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {propertyData.price_suffix || "/ night"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. GALLERY */}
        {activeGallery.length > 0 ? (
          <div className="space-y-4">
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl bg-stone-900 border border-stone-200">
              <img
                src={activeGallery[activePhotoIdx]?.url || activeGallery[0]?.url}
                alt={activeGallery[activePhotoIdx]?.title}
                className="w-full h-full object-cover transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute top-5 left-5">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-800 transition shadow-md active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute top-5 right-5">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-800 transition shadow-md active:scale-95 cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-800"}`} />
                </button>
              </div>

              {activeGallery.length > 1 && (
                <div className="absolute bottom-5 right-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((p) => (p === 0 ? activeGallery.length - 1 : p - 1))}
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-white/90 font-mono bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                    {activePhotoIdx + 1} / {activeGallery.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((p) => (p === activeGallery.length - 1 ? 0 : p + 1))}
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {activeGallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {activeGallery.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-24 sm:w-32 aspect-[4/3] rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? "border-[#E5B869] ring-2 ring-[#E5B869]/30 scale-95"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400 gap-2">
            <Home className="w-12 h-12 stroke-[1.5]" />
            <p className="text-sm font-semibold">No residence photos available</p>
          </div>
        )}

        {/* 3. PROPERTY SPECS SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-[#B78A52]">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">Rooms</span>
              <span className="text-sm font-bold text-slate-800">{propertyData.beds || roomsList.length} Suites</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-[#B78A52]">
              <Bath className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">Bathrooms</span>
              <span className="text-sm font-bold text-slate-800">{propertyData.baths || 1} Baths</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-[#B78A52]">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">Area</span>
              <span className="text-sm font-bold text-slate-800">{propertyData.sqft ? `${propertyData.sqft} sqft` : "Spacious"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-[#B78A52]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">Available Suites</span>
              <span className="text-sm font-bold text-slate-800">{roomsList.filter(r => r.status === 'available').length} Open</span>
            </div>
          </div>
        </div>

        {/* 4. ROOMS SECTION (CLICK CARD TO VIEW DETAIL) */}
        <section className="space-y-6 pt-2" id="available-rooms">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200/80 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#B78A52] block mb-1">
                Accommodation Options
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Available Rooms & Suites
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Click any suite card below to inspect full photos, amenities, and choose to book.
            </p>
          </div>

          {roomsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roomsList.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleOpenRoomDetail(room)}
                  className="cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <RoomCard
                    room={room}
                    isSelected={false}
                    onSelect={() => handleOpenRoomDetail(room)}
                    onBookDirect={() => handleOpenRoomDetail(room)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-sm">
              No rooms currently listed under this residence.
            </div>
          )}
        </section>

        {/* 5. PROPERTY DETAILS, AMENITIES & HOST */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-stone-200">
          <div className="lg:col-span-8 space-y-8">
            {/* AMENITIES */}
            {parsedAmenities.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-slate-900">Residence Features & Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {parsedAmenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      {getAmenityIcon(typeof amenity === "string" ? amenity : amenity?.name)}
                      <span>{typeof amenity === "string" ? amenity : amenity?.name || "Feature"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TABBED DETAILS */}
            <div className="space-y-6 pt-4 border-t border-stone-200">
              <div className="flex gap-2 border-b border-stone-200 pb-2">
                {[
                  { id: "overview", label: "Property Overview" },
                  { id: "rules", label: "House Rules" },
                  { id: "reviews", label: `Reviews (${allReviews.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === tab.id ? "bg-[#06241e] text-[#E5B869]" : "text-stone-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div className="prose prose-stone text-xs leading-relaxed text-stone-600 space-y-3">
                  <p>{propertyData.description || "Ultra-luxurious residential property featuring premium accommodations."}</p>
                  <p>
                    Full address: <strong className="text-slate-800">{propertyData.address || propertyData.location}</strong>
                  </p>
                </div>
              )}

              {activeTab === "rules" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-stone-200">
                    <Clock className="w-4 h-4 text-[#B78A52] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Check-in / Check-out</strong>
                      <span>Check-in: 3:00 PM | Check-out: 11:00 AM</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-stone-200">
                    <ShieldCheck className="w-4 h-4 text-[#B78A52] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block font-semibold">Identity Verification</strong>
                      <span>Passport or national identification required on arrival.</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-3">
                  {allReviews.length > 0 ? (
                    allReviews.map((rev, i) => (
                      <div key={rev.id || i} className="p-4 rounded-xl bg-white border border-stone-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{rev.reviewer_name || "Verified Guest"}</span>
                          <div className="flex text-amber-500">
                            {[...Array(Number(rev.rating) || 5)].map((_, idx) => (
                              <Star key={idx} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-600">{rev.comment || rev.review}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400">No reviews yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* HOST CONTACT CARD */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5 sticky top-24">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Property Host</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#06241e] text-[#E5B869] font-bold flex items-center justify-center ring-2 ring-[#E5B869]">
                  {(propertyData.owner_name || "Host").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{propertyData.owner_name || "Host Representative"}</h4>
                  <p className="text-xs text-stone-400">Authorized Luxury Host</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                {propertyData.owner_phone && (
                  <a
                    href={`tel:${propertyData.owner_phone}`}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-slate-800 transition"
                  >
                    <Phone className="w-4 h-4 text-[#B78A52]" />
                    <span>{propertyData.owner_phone}</span>
                  </a>
                )}
                {propertyData.owner_email && (
                  <a
                    href={`mailto:${propertyData.owner_email}`}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-slate-800 transition"
                  >
                    <Mail className="w-4 h-4 text-[#B78A52]" />
                    <span>{propertyData.owner_email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

    

      <Footer />
    </div>
  );
}