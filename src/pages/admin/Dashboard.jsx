import React, { useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Building2,
  BedDouble,
  Users as UsersIcon,
  KeyRound,
  RotateCcw,
  Globe,
  RefreshCw,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAvatarUrl } from "../../utils/auth";
import ProfileModal from "../../components/common/ProfileModal";
import { resolveImageUrl } from "../../utils/imageHelper";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const outletCtx = useOutletContext() || {};

  const properties = outletCtx.properties || [];
  const rooms = outletCtx.rooms || [];
  const users = outletCtx.users || [];
  const rentals = outletCtx.rentals || [];
  const rentalRequests = outletCtx.rentalRequests || [];
  const stats = outletCtx.stats || {
    totalProperties: properties.length,
    totalRooms: rooms.length,
    availableRooms: rooms.filter(
      (r) => (r.status || "available").toLowerCase() === "available"
    ).length,
    occupiedRooms: 0,
    totalUsers: users.length,
    totalRentals: rentals.length,
    totalRequests: rentalRequests.length,
  };
  const loading = outletCtx.loading ?? false;
  const isRefreshing = outletCtx.isRefreshing ?? false;
  const refreshAllData = outletCtx.refreshAllData || (() => {});

  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("Weekly");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Filter rooms in main table
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter((rm) => {
      const name = (rm.name || "").toLowerCase();
      const num = String(rm.room_number || "").toLowerCase();
      const prop = (rm.property_title || "").toLowerCase();
      const type = (rm.room_type || "").toLowerCase();
      return name.includes(q) || num.includes(q) || prop.includes(q) || type.includes(q);
    });
  }, [rooms, searchQuery]);

  // Compute Occupancy percentage
  const occupancyPercentage = useMemo(() => {
    if (!stats.totalRooms) return 0;
    const occupied = stats.totalRooms - stats.availableRooms;
    return Math.round((occupied / stats.totalRooms) * 100);
  }, [stats]);

  const availablePercentage = 100 - occupancyPercentage;

  // Property room counts for bar chart
  const propertyBars = useMemo(() => {
    if (properties.length === 0) {
      return [
        { name: "BKK1 Modern", count: 2, height: "70%" },
        { name: "Toul Kork", count: 1, height: "40%" },
      ];
    }
    const maxRooms = Math.max(
      ...properties.map((p) => (p.rooms ? p.rooms.length : 1)),
      1
    );
    return properties.map((p) => {
      const count = p.rooms ? p.rooms.length : 0;
      const pct = Math.max(20, Math.round((count / maxRooms) * 100));
      return {
        name: p.title || p.name || `Property #${p.id}`,
        count,
        height: `${pct}%`,
      };
    });
  }, [properties]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f2ff] via-[#eae0fd] to-[#f3ebff] p-4 md:p-8 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ---------------- Top Navbar ---------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Rental Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                Live DB
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time property, room suite, and reservation inventory
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms or properties..."
                className="bg-white/80 backdrop-blur-md pl-4 pr-9 py-2 rounded-xl text-xs border border-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-60"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              title="Refresh all data from database"
              className="p-2 rounded-xl bg-white/80 hover:bg-white border border-purple-100 shadow-sm text-slate-600 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`}
              />
            </button>

            {/* View Homepage Quick Link */}
            <button
              onClick={() => navigate("/")}
              title="Go to User Homepage"
              className="hidden sm:flex items-center gap-1.5 bg-white/80 hover:bg-white text-slate-800 px-3 py-2 rounded-xl border border-purple-100 shadow-sm text-xs font-semibold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>View Site</span>
            </button>

            {/* Profile */}
            <div
              onClick={() => setProfileModalOpen(true)}
              title="Click to view/edit profile"
              className="flex items-center space-x-2 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/80 shadow-sm cursor-pointer hover:bg-white transition"
            >
              {user?.avatar || user?.avatar_url ? (
                <img
                  src={getAvatarUrl(user)}
                  alt={user?.name || "Admin"}
                  className="w-7 h-7 rounded-full object-cover shadow-sm border border-indigo-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {(user?.name || "Admin").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                {user?.name || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- Main Dashboard Grid Layout ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT CONTENT COLUMN (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Real Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat 1: Properties */}
              <div
                onClick={() => navigate("/admin/properties")}
                className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition"
              >
                <div>
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl w-fit mb-3">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {stats.totalProperties}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Active Properties
                  </p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    Real DB
                  </span>
                </div>
              </div>

              {/* Stat 2: Room Suites */}
              <div
                onClick={() => navigate("/admin/rooms")}
                className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition"
              >
                <div>
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl w-fit mb-3">
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {stats.totalRooms}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Total Room Suites
                  </p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    {stats.availableRooms} Free
                  </span>
                </div>
              </div>

              {/* Stat 3: Users & Tenants */}
              <div
                onClick={() => navigate("/admin/users")}
                className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition"
              >
                <div>
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-xl w-fit mb-3">
                    <UsersIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {stats.totalUsers}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Registered Users
                  </p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                    Tenants
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Monthly Rental Revenue Overview */}
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-800 text-base">
                    Rental Rate & Occupancy Overview
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Live dynamic room inventory pricing across all properties
                  </p>
                </div>
                <div className="relative">
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-white/80 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer appearance-none pr-8"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="h-44 w-full relative">
                {/* Guidelines */}
                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-300 font-medium pointer-events-none">
                  <div className="border-b border-slate-100 pb-1">$1.00</div>
                  <div className="border-b border-slate-100 pb-1">$0.75</div>
                  <div className="border-b border-slate-100 pb-1">$0.50</div>
                  <div className="border-b border-slate-100 pb-1">$0.25</div>
                  <div>$0.00</div>
                </div>

                {/* SVG Curve Line */}
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 150"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0,120 Q 50,80 100,90 T 200,60 T 300,45 T 400,30 T 500,25"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="300"
                    cy="45"
                    r="5"
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                </svg>

                <div className="absolute left-[60%] top-[15%] -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-xl text-[10px] font-bold shadow-lg flex flex-col items-center">
                  <span className="text-slate-400 font-normal">Active Suites</span>
                  <span>{rooms.length} Suites Ready</span>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-3 px-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* 3. Real Suites & Units Data Table */}
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-slate-800 text-base">
                    Room Suites & Listings Table
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Live room units fetched directly from database API
                  </p>
                </div>
                <button
                  onClick={() => navigate("/admin/rooms")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                >
                  <span>Manage All ({rooms.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-semibold">Unit / ID</th>
                      <th className="pb-3 font-semibold">Suite Preview</th>
                      <th className="pb-3 font-semibold">Property</th>
                      <th className="pb-3 font-semibold">Type & Specs</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Price Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 font-medium text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                          <span>Loading real rooms from database...</span>
                        </td>
                      </tr>
                    ) : filteredRooms.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No rooms found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredRooms.map((room) => {
                        const imgUrl = resolveImageUrl(room.images?.[0]);
                        const isAvailable =
                          (room.status || "available").toLowerCase() === "available";

                        return (
                          <tr
                            key={room.id}
                            onClick={() => navigate("/admin/rooms")}
                            className="hover:bg-white/60 transition cursor-pointer"
                          >
                            {/* ID & Room No */}
                            <td className="py-3 text-slate-500 font-semibold">
                              #{room.id} • Room {room.room_number}
                            </td>

                            {/* Suite Preview */}
                            <td className="py-3">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                                  {imgUrl ? (
                                    <img
                                      src={imgUrl}
                                      alt={room.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon className="w-4 h-4 text-slate-300" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 line-clamp-1">
                                    {room.name || `Room ${room.room_number}`}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {room.badge || "Standard"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Property */}
                            <td className="py-3 text-slate-600 line-clamp-1">
                              {room.property_title || "Modern Suites"}
                            </td>

                            {/* Specs */}
                            <td className="py-3 text-slate-500 text-[11px]">
                              <span>{room.room_type || "Studio"}</span> •{" "}
                              <span>{room.sqft || 35} sqft</span>
                            </td>

                            {/* Status */}
                            <td className="py-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  isAvailable
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {isAvailable ? "Available" : "Occupied"}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-3 text-right font-extrabold text-slate-800 font-mono">
                              ${Number(room.price).toFixed(2)}
                              <span className="text-[10px] font-normal text-slate-400">
                                /nt
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR COLUMN (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Donut Chart: Occupancy Breakdown */}
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm flex flex-col items-center min-h-[260px]">
              <div className="w-full flex justify-between items-center mb-4">
                <h2 className="font-bold text-slate-800 text-base">
                  Occupancy Status
                </h2>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Real Time
                </span>
              </div>

              {/* Dynamic Conic Gradient Donut */}
              <div
                className="relative w-40 h-40 rounded-full flex items-center justify-center my-2 shadow-inner"
                style={{
                  background: `conic-gradient(#10b981 0% ${availablePercentage}%, #f59e0b ${availablePercentage}% 100%)`,
                }}
              >
                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-md">
                  <span className="text-2xl font-black text-slate-800">
                    {availablePercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Available
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex justify-center items-center space-x-4 mt-4 text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">
                    Available ({stats.availableRooms})
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-600">
                    Occupied ({stats.occupiedRooms})
                  </span>
                </div>
              </div>
            </div>

            {/* Property Distribution Card */}
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold text-slate-800 text-base">
                    Property Distribution
                  </h2>
                  <button
                    onClick={() => navigate("/admin/properties")}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    View All
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-6">
                  Number of managed suites per building
                </p>

                {/* Bars Graphic */}
                <div className="space-y-4">
                  {propertyBars.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[180px]">{item.name}</span>
                        <span className="text-indigo-600 font-bold">
                          {item.count} {item.count === 1 ? "Unit" : "Units"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: item.height }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Action Button */}
              <div className="pt-4 border-t border-slate-100 mt-6">
                <button
                  onClick={() => navigate("/admin/rooms/add")}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Room Suite</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
