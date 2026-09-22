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
} from "lucide-react";
import { fetchRoomById } from "../../Api/roomApi";
import { fetchProperties } from "../../Api/propertyApi";

function ViewRoomPage() {
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

        // Fetch room and property list concurrently
        const [roomRes, propertiesRes] = await Promise.all([
          fetchRoomById(id),
          fetchProperties().catch(() => null),
        ]);

        const roomData = roomRes?.data?.data || roomRes?.data || roomRes;

        if (!roomData) {
          throw new Error("Room details could not be found.");
        }

        // Parse properties array to match property name
        const rawProperties = Array.isArray(propertiesRes?.data?.data)
          ? propertiesRes.data.data
          : Array.isArray(propertiesRes?.data)
            ? propertiesRes.data
            : [];

        const matchedProperty = rawProperties.find(
          (p) =>
            String(p.id) ===
            String(roomData.property_id || roomData.property?.id),
        );

        if (isMounted) {
          setRoom(roomData);
          setProperty(matchedProperty || roomData.property || null);
        }
      } catch (err) {
        console.error("Failed to fetch room details:", err);
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load room details.",
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

  // Status Badge Formatting Helper
  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">Available</span>
          </span>
        );
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span className="capitalize">Reserved</span>
          </span>
        );
      case "rented":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Home className="w-3.5 h-3.5" />
            <span className="capitalize">Rented</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Tag className="w-3.5 h-3.5" />
            <span className="capitalize">{status || "Unknown"}</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading room details...</p>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-xs rounded-xl hover:bg-indigo-700 transition"
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
    room.property_name ||
    room.property?.name ||
    `Property #${room.property_id || "N/A"}`;

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
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Room</span>
          </Link>
        </div>

        {/* Room Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <BedSingle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  Room {room.room_number || room.number}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                  ID: #{room.id}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{propertyName}</span>
              </p>
            </div>
          </div>

          <div>{getStatusBadge(room.status)}</div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Specification Card */}
          <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Room Details & Type
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Room Type
                  </span>
                  <span className="text-base font-bold text-slate-800">
                    {room.room_type || "N/A"}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Room Number
                  </span>
                  <span className="text-base font-bold text-slate-800">
                    {room.room_number || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Description
              </span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[100px] text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {room.description
                  ? room.description
                  : "No additional description provided for this room."}
              </div>
            </div>
          </div>

          {/* Pricing & Metadata Side Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Financial Overview
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600/70 block mb-1">
                    Monthly Price
                  </span>
                  <div className="text-2xl font-bold text-indigo-900">
                    ${parseFloat(room.price || 0).toFixed(2)}
                    <span className="text-xs font-medium text-indigo-600 ml-1">
                      / month
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Deposit Required
                  </span>
                  <div className="text-lg font-bold text-slate-800">
                    ${parseFloat(room.deposit || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Created At:
                </span>
                <span className="font-semibold text-slate-700">
                  {room.created_at
                    ? new Date(room.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Last Updated:
                </span>
                <span className="font-semibold text-slate-700">
                  {room.updated_at
                    ? new Date(room.updated_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewRoomPage;
