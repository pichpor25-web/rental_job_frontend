import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BedSingle,
  Building2,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  X,
  TrendingUp,
  Check,
  Loader2,
  AlertTriangle,
  Tag,
  Image as ImageIcon,
  Users,
  Bath,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import { fetchRooms, deleteRoom } from "../../Api/roomApi";
import { fetchProperties } from "../../Api/propertyApi";
import { resolveImageUrl } from "../../utils/imageHelper";

const ROOM_STATUSES = [
  {
    value: "available",
    label: "Available",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  {
    value: "reserved",
    label: "Reserved",
    badge: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  {
    value: "rented",
    label: "Rented",
    badge: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20",
    dot: "bg-rose-500",
  },
  {
    value: "occupied",
    label: "Occupied",
    badge: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20",
    dot: "bg-blue-500",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    badge: "bg-slate-100 text-slate-700 border-slate-300 ring-slate-600/20",
    dot: "bg-slate-400",
  },
];

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

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

const normalizeRoom = (room) => {
  const price = toNumberOrNull(room.price) ?? 0;
  const deposit = toNumberOrNull(room.deposit) ?? 0;
  return {
    ...room,
    property_id: room.property_id ?? room.property?.id ?? null,
    property_name:
      room.property?.name || room.property_name || "Unassigned Property",
    name: room.name || "",
    badge: room.badge || "",
    badge_color: room.badge_color || "bg-indigo-50 text-indigo-700 border-indigo-200",
    room_type: room.room_type || "Standard",
    price,
    deposit,
    max_guests: toNumberOrNull(room.max_guests) ?? 1,
    bed_type: room.bed_type || "Standard",
    bathrooms: toNumberOrNull(room.bathrooms) ?? 1,
    sqft: toNumberOrNull(room.sqft) ?? 0,
    available_count: toNumberOrNull(room.available_count) ?? 1,
    perks: parseArray(room.perks),
    images: parseArray(room.images),
    status: (room.status || "available").toLowerCase(),
    description: room.description || "",
  };
};

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed top-5 right-5 z-[60] flex items-start gap-3 max-w-sm w-full px-4 py-3 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-top-2 duration-200 ${
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
      role="alert"
    >
      {isError ? (
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
      ) : (
        <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
      )}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-current/60 hover:text-current shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tint, trend }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium mt-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tint}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const item = ROOM_STATUSES.find((s) => s.value === status) || {
    label: status,
    badge: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ring-1 ${item.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

export default function RoomManagement() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [roomsRes, propsRes] = await Promise.all([
          fetchRooms(),
          fetchProperties(),
        ]);

        const rawRooms = Array.isArray(roomsRes?.data)
          ? roomsRes.data
          : Array.isArray(roomsRes?.data?.data)
          ? roomsRes.data.data
          : Array.isArray(roomsRes)
          ? roomsRes
          : [];

        setRooms(rawRooms.map(normalizeRoom));

        const rawProps = Array.isArray(propsRes?.data)
          ? propsRes.data
          : Array.isArray(propsRes?.data?.data)
          ? propsRes.data.data
          : Array.isArray(propsRes)
          ? propsRes
          : [];

        setProperties(rawProps);
      } catch (error) {
        console.error("Failed to load rooms:", error);
        setRooms([]);
        setToast({ type: "error", message: "Couldn't load room management data." });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (activeMenuId === null) return;
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [activeMenuId]);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const rentedRooms = rooms.filter(
    (r) => r.status === "rented" || r.status === "occupied"
  ).length;

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms.filter((r) => {
      const matchesSearch =
        !q ||
        r.room_number?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.room_type?.toLowerCase().includes(q) ||
        r.property_name?.toLowerCase().includes(q) ||
        r.badge?.toLowerCase().includes(q);

      const matchesProperty =
        selectedPropertyFilter === "ALL" ||
        String(r.property_id) === selectedPropertyFilter;

      const matchesStatus =
        selectedStatusFilter === "ALL" || r.status === selectedStatusFilter;

      return matchesSearch && matchesProperty && matchesStatus;
    });
  }, [rooms, searchQuery, selectedPropertyFilter, selectedStatusFilter]);

  const handleDelete = async (room) => {
    if (!confirm(`Delete room "${room.room_number || room.name}"?`)) return;

    try {
      setDeletingId(room.id);
      await deleteRoom(room.id);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      setActiveMenuId(null);
      setToast({ type: "success", message: `Room "${room.room_number}" removed.` });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Failed to delete room.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Room Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Oversee units, pricing tiers, layout dimensions, and live booking readiness.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/rooms/add")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-600/20 hover:shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Total Inventory"
            value={loading ? "—" : totalRooms}
            icon={BedSingle}
            tint="bg-indigo-50 text-indigo-600"
            trend="+5 new units this month"
          />
          <StatCard
            label="Available Now"
            value={loading ? "—" : availableRooms}
            icon={Check}
            tint="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Occupied / Rented"
            value={loading ? "—" : rentedRooms}
            icon={Building2}
            tint="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room #, suite name, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedPropertyFilter}
              onChange={(e) => setSelectedPropertyFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Statuses</option>
              {ROOM_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {(searchQuery || selectedPropertyFilter !== "ALL" || selectedStatusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPropertyFilter("ALL");
                  setSelectedStatusFilter("ALL");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Refined Modern Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Room & Unit</th>
                  <th className="py-3.5 px-4">Type & Badges</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Specifications</th>
                  <th className="py-3.5 px-4">Key Amenities</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 pr-6 text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 text-center">
                        <div className="h-4 w-6 bg-slate-100 rounded mx-auto" />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-4 w-32 bg-slate-100 rounded" />
                            <div className="h-3 w-40 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><div className="h-5 w-20 bg-slate-100 rounded-full" /></td>
                      <td className="p-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                      <td className="p-4"><div className="h-6 w-20 bg-slate-100 rounded-full mx-auto" /></td>
                      <td className="p-4"><div className="h-6 w-6 bg-slate-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => {
                    const primaryImage = resolveImageUrl(room.images?.[0]);

                    return (
                      <tr
                        key={room.id}
                        className="hover:bg-slate-50/70 transition duration-150 group"
                      >
                        {/* ID */}
                        <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                          {room.id}
                        </td>

                        {/* Merged Room + Thumbnail + Property */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {primaryImage ? (
                                <img
                                  src={primaryImage}
                                  alt={room.room_number}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                                <span>Room {room.room_number || "—"}</span>
                                {room.name && (
                                  <span className="text-xs font-normal text-slate-500 truncate">
                                    • {room.name}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{room.property_name}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Room Type & Badge */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                              <Tag className="w-3 h-3 text-slate-400" />
                              {room.room_type}
                            </span>
                            {room.badge && (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${room.badge_color}`}
                              >
                                {room.badge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price & Deposit */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 font-mono text-sm">
                            ${room.price.toFixed(2)}
                            <span className="text-[11px] font-normal text-slate-400"> /mo</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Deposit: ${room.deposit.toFixed(2)}
                          </div>
                        </td>

                        {/* Specs */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-xs text-slate-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 font-medium">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                {room.max_guests} Guests
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1">
                                <Bath className="w-3.5 h-3.5 text-slate-400" />
                                {room.bathrooms} Bath
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span>{room.bed_type}</span>
                              {room.sqft > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{room.sqft} sqft</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Perks */}
                        <td className="py-4 px-4">
                          {room.perks && room.perks.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                              {room.perks.slice(0, 2).map((perk, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-600 font-medium whitespace-nowrap"
                                >
                                  {perk}
                                </span>
                              ))}
                              {room.perks.length > 2 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-50 text-indigo-600 font-bold">
                                  +{room.perks.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">None</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <StatusBadge status={room.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 pr-6 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === room.id ? null : room.id);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          >
                            {deletingId === room.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                            ) : (
                              <MoreHorizontal className="w-4 h-4" />
                            )}
                          </button>

                          {activeMenuId === room.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="origin-top-right absolute right-6 top-10 w-40 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                            >
                              <button
                                onClick={() => navigate(`/admin/rooms/view/${room.id}`)}
                                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 w-full text-left"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" /> View Details
                              </button>
                              <button
                                onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}
                                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 w-full text-left"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Edit Room
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={() => handleDelete(room)}
                                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 w-full text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete Unit
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <BedSingle className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No rooms found matching your criteria.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-700">{filteredRooms.length}</span> of{" "}
                <span className="font-semibold text-slate-700">{totalRooms}</span> rooms
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                  disabled
                >
                  Previous
                </button>
                <button
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}