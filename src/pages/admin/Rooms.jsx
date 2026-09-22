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
  Star,
  Image as ImageIcon,
  Edit,
} from "lucide-react";
import { fetchRooms, updateRoom, deleteRoom } from "../../Api/roomApi";
import { fetchProperties } from "../../Api/propertyApi";

const ROOM_STATUSES = [
  {
    value: "available",
    label: "Available",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "reserved",
    label: "Reserved",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "rented",
    label: "Rented",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    value: "occupied",
    label: "Occupied",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    color: "bg-slate-100 text-slate-700 border-slate-300",
  },
];

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeRoom = (room) => {
  const price = toNumberOrNull(room.price) ?? 0;
  const deposit = toNumberOrNull(room.deposit) ?? 0;
  return {
    ...room,
    property_id: room.property_id ?? room.property?.id ?? null,
    property_name:
      room.property?.name || room.property_name || "Unassigned Property",
    price,
    deposit,
    total_move_in: price + deposit,
    status: room.status || "available",
    images: Array.isArray(room.images) ? room.images : [],
    reviews: Array.isArray(room.reviews) ? room.reviews : [],
  };
};

const EMPTY_FORM = {
  property_id: "",
  room_number: "",
  room_type: "Studio",
  price: "",
  deposit: "",
  status: "available",
  description: "",
};

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed top-5 right-5 z-[60] flex items-start gap-3 max-w-sm w-full px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-2 duration-200 ${
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
      role="alert"
    >
      {isError ? (
        <AlertTriangle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
      ) : (
        <Check className="w-4.5 h-4.5 mt-0.5 shrink-0" />
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
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tint}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const matched = ROOM_STATUSES.find((s) => s.value === status) || {
    label: status,
    color: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${matched.color}`}
    >
      {matched.label}
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

  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState("view");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState(EMPTY_FORM);

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
        console.error("Failed to fetch room management data:", error);
        setRooms([]);
        showToast("error", "Couldn't load rooms data. Please try again.");
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

  const showToast = (type, message) => setToast({ type, message });

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const rentedRooms = rooms.filter(
    (r) => r.status === "rented" || r.status === "occupied",
  ).length;

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms.filter((r) => {
      const roomNum = (r.room_number || "").toLowerCase();
      const roomType = (r.room_type || "").toLowerCase();
      const propName = (r.property_name || "").toLowerCase();

      const matchesSearch =
        !q ||
        roomNum.includes(q) ||
        roomType.includes(q) ||
        propName.includes(q);

      const matchesProperty =
        selectedPropertyFilter === "ALL" ||
        String(r.property_id) === selectedPropertyFilter;

      const matchesStatus =
        selectedStatusFilter === "ALL" || r.status === selectedStatusFilter;

      return matchesSearch && matchesProperty && matchesStatus;
    });
  }, [rooms, searchQuery, selectedPropertyFilter, selectedStatusFilter]);

  const validate = (data) => {
    const errors = {};
    if (data.room_number && data.room_number.trim().length > 20)
      errors.room_number = "Room number must be 20 characters or fewer";
    if (data.price !== "" && Number(data.price) < 0)
      errors.price = "Price cannot be negative";
    if (data.deposit !== "" && Number(data.deposit) < 0)
      errors.deposit = "Deposit cannot be negative";
    if (data.room_type && data.room_type.trim().length > 50)
      errors.room_type = "Room type must be 50 characters or fewer";
    if (data.room_number && !data.room_number.trim())
      errors.room_number = "Room number is required";
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const openRoomModal = (mode, room) => {
    const normalized = normalizeRoom(room);
    setSelectedRoom(normalized);
    setRoomModalMode(mode);
    setFormErrors({});
    setFormData({
      property_id: normalized.property_id ? String(normalized.property_id) : "",
      room_number: normalized.room_number || "",
      room_type: normalized.room_type || "Studio",
      price: normalized.price ?? "",
      deposit: normalized.deposit ?? "",
      status: normalized.status || "available",
      description: normalized.description || "",
    });
    setRoomModalOpen(true);
    setActiveMenuId(null);
  };

  const closeRoomModal = () => {
    setRoomModalOpen(false);
    setSelectedRoom(null);
    setRoomModalMode("view");
    setFormErrors({});
    setFormData(EMPTY_FORM);
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;
    const errors = validate(formData);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...(formData.property_id && {
          property_id: Number(formData.property_id),
        }),
        ...(formData.room_number && {
          room_number: formData.room_number.trim(),
        }),
        room_type: formData.room_type,
        ...(formData.price !== "" && { price: parseFloat(formData.price) }),
        ...(formData.deposit !== "" && {
          deposit: parseFloat(formData.deposit),
        }),
        status: formData.status,
        description: formData.description.trim(),
      };

      const response = await updateRoom(selectedRoom.id, payload);
      const updatedRoom = normalizeRoom(
        response?.data?.data ??
          response?.data ?? { ...selectedRoom, ...payload },
      );

      setRooms((prev) =>
        prev.map((room) => (room.id === selectedRoom.id ? updatedRoom : room)),
      );
      showToast("success", `Room "${updatedRoom.room_number}" was updated.`);
      closeRoomModal();
    } catch (error) {
      console.error("Failed to update room:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to update room.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room) => {
    if (
      !confirm(
        `Delete room "${room.room_number}"? This action cannot be undone.`,
      )
    )
      return;

    try {
      setDeletingId(room.id);
      await deleteRoom(room.id);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      setActiveMenuId(null);
      showToast("success", `Room "${room.room_number}" was deleted.`);
    } catch (error) {
      console.error("Failed to delete room:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to delete room.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Room Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage individual units, occupancy statuses, rental rates, and
              security deposits.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/rooms/add")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <StatCard
            label="Total Units"
            value={loading ? "—" : totalRooms}
            icon={BedSingle}
            tint="bg-indigo-50 text-indigo-600"
            trend="+5 new units this month"
          />
          <StatCard
            label="Available Units"
            value={loading ? "—" : availableRooms}
            icon={Check}
            tint="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Rented / Occupied"
            value={loading ? "—" : rentedRooms}
            icon={Building2}
            tint="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room #, type, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedPropertyFilter}
              onChange={(e) => setSelectedPropertyFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">All Statuses</option>
              {ROOM_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <button className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Rooms Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Room / Property</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Rent Price</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4">Move-in Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-5 w-10 bg-slate-100 rounded-full" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 bg-slate-100 rounded" />
                          <div className="h-3 w-44 bg-slate-100 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-20 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-16 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-16 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-16 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 w-20 bg-slate-100 rounded-full" />
                      </td>
                      <td className="py-4 px-4" />
                    </tr>
                  ))
                ) : filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => {
                    const primaryImage =
                      room.images?.[0]?.full_url ||
                      room.images?.[0]?.image_path;

                    return (
                      <tr
                        key={room.id}
                        className="hover:bg-slate-50/60 transition duration-150"
                      >
                        <td className="py-4 px-4 font-medium text-slate-900">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            #{room.id}
                          </span>
                        </td>

                        {/* Room Image Thumbnail */}
                        <td className="py-4 px-4">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={room.room_number}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                              <BedSingle className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-[14rem]">
                                Room {room.room_number}
                              </div>
                              <div className="text-xs text-slate-400 truncate max-w-xs flex items-center gap-1">
                                <Building2 className="w-3 h-3 shrink-0" />
                                <span>{room.property_name}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-600 font-medium">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {room.room_type}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-900 font-mono">
                          ${room.price.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 font-medium text-slate-600 font-mono">
                          ${room.deposit.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 font-bold text-indigo-600 font-mono">
                          ${room.total_move_in.toFixed(2)}
                        </td>

                        <td className="py-4 px-4">
                          <StatusBadge status={room.status} />
                        </td>

                        <td className="py-4 px-4 pr-6 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(
                                activeMenuId === room.id ? null : room.id,
                              );
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                          >
                            {deletingId === room.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <MoreHorizontal className="w-5 h-5" />
                            )}
                          </button>

                          {activeMenuId === room.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="origin-top-right absolute right-6 mt-2 w-44 rounded-xl bg-white shadow-lg border border-slate-100 py-1 z-20"
                            >
                              <button
                                onClick={() =>
                                  navigate(`/admin/rooms/view/${room.id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/admin/rooms/edit/${room.id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit Room
                              </button>
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                onClick={() => handleDelete(room)}
                                className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="py-16 text-center">
                      <BedSingle className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        {rooms.length === 0
                          ? "No rooms added yet."
                          : "No rooms match your filter criteria."}
                      </p>
                      {rooms.length === 0 ? (
                        <button
                          onClick={() => navigate("/admin/rooms/add")}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="w-4 h-4" /> Add your first room
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedPropertyFilter("ALL");
                            setSelectedStatusFilter("ALL");
                          }}
                          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredRooms.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalRooms}
                </span>{" "}
                rooms
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
