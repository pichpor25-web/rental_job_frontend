import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  BedSingle,
  Building2,
  FileText,
  DollarSign,
  ArrowLeft,
  Loader2,
  Tag,
  Edit,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Users,
  Bath,
  Maximize2,
  Image as ImageIcon,
  CheckSquare,
  Layers,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { fetchRoomById } from "../../Api/roomApi";
import { fetchProperties } from "../../Api/propertyApi";
import { resolveImageUrl } from "../../utils/imageHelper";

function responseData(response) {
  return response?.data?.data || response?.data || response;
}

const parseArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function ViewRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [roomRes, propertiesRes] = await Promise.all([
          fetchRoomById(id),
          fetchProperties().catch(() => null),
        ]);

        const roomData = responseData(roomRes);

        if (!roomData) {
          throw new Error("Room details could not be found.");
        }

        const rawProperties = responseData(propertiesRes);
        const propertyList = Array.isArray(rawProperties) ? rawProperties : [];

        const matchedProperty = propertyList.find(
          (p) =>
            String(p.id) ===
            String(roomData.property_id || roomData.property?.id)
        );

        if (isMounted) {
          setRoom({
            ...roomData,
            images: parseArray(roomData.images)
              .map((image) =>
                typeof image === "string"
                  ? resolveImageUrl(image)
                  : resolveImageUrl(image?.full_url || image?.image_path || image?.url)
              )
              .filter(Boolean),
            perks: parseArray(roomData.perks),
          });
          setProperty(matchedProperty || roomData.property || null);
        }
      } catch (err) {
        console.error("Failed to fetch room details:", err);
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load room details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadRoomData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Available</span>
          </span>
        );
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Reserved</span>
          </span>
        );
      case "rented":
      case "occupied":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Home className="w-3.5 h-3.5" />
            <span className="capitalize">{s}</span>
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Wrench className="w-3.5 h-3.5" />
            <span>Maintenance</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="capitalize">{status || "Unknown"}</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Unable to Load Room
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            to="/admin/rooms"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Room Management</span>
          </Link>
        </div>
      </div>
    );
  }

  const propertyName =
    property?.name ||
    property?.title ||
    room.property_name ||
    room.property?.name ||
    `Property #${room.property_id || "N/A"}`;

  const priceNum = parseFloat(room.price || 0);
  const depositNum = parseFloat(room.deposit || 0);
  const moveInCost = priceNum + depositNum;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/admin/rooms"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Rooms</span>
          </Link>

          <Link
            to={`/admin/rooms/edit/${room.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Room</span>
          </Link>
        </div>

        {/* Room Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {room.images && room.images.length > 0 ? (
              <img
                src={room.images[0]}
                alt={room.room_number}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <BedSingle className="w-8 h-8" />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Room {room.room_number || "—"}
                </h1>
                {room.name && (
                  <span className="text-lg font-medium text-slate-500">
                    ({room.name})
                  </span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                  ID: #{room.id}
                </span>
                {room.badge && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      room.badge_color ||
                      "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    {room.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <Link
                    to={`/admin/properties/view/${room.property_id}`}
                    className="text-slate-800 hover:text-indigo-600 font-semibold transition"
                  >
                    {propertyName}
                  </Link>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{room.room_type || "Standard"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>{room.available_count ?? 1}</strong> unit(s) available
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0">{getStatusBadge(room.status)}</div>
        </div>

        {/* Specifications Highlight Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Max Occupancy
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {room.max_guests ? `${room.max_guests} Guests` : "—"}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BedSingle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Bed Setup
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5 truncate">
                {room.bed_type || "Standard Bed"}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Bath className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Bathrooms
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {room.bathrooms ? `${room.bathrooms} Bath` : "—"}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Floor Area
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {room.sqft ? `${Number(room.sqft).toLocaleString()} sqft` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery Section */}
            {room.images && room.images.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Room Images ({room.images.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-36"
                    >
                      <img
                        src={imgUrl}
                        alt={`Room photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description & Notes
                </span>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {room.description ||
                  "No detailed description provided for this room."}
              </div>
            </div>

            {/* Perks Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Perks & Room Amenities
                </span>
              </div>

              {room.perks && room.perks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {room.perks.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No perks or amenities listed for this room.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Overview */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Financial Breakdown
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600/70 block mb-0.5">
                    Monthly Rent
                  </span>
                  <div className="text-2xl font-bold text-indigo-900 font-mono">
                    ${priceNum.toFixed(2)}
                    <span className="text-xs font-normal text-indigo-600 ml-1">
                      / mo
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Security Deposit
                  </span>
                  <div className="text-lg font-bold text-slate-800 font-mono">
                    ${depositNum.toFixed(2)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Est. Total Move-In
                  </span>
                  <span className="text-sm font-bold text-indigo-600 font-mono">
                    ${moveInCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* System Records */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-100">
                System Records
              </span>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Created:
                </span>
                <span className="font-semibold text-slate-700">
                  {room.created_at
                    ? new Date(room.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Last Updated:
                </span>
                <span className="font-semibold text-slate-700">
                  {room.updated_at
                    ? new Date(room.updated_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
