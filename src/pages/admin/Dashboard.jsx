import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  MoreHorizontal,
  ShoppingBag,
  Box,
  RotateCcw,
  Globe,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAvatarUrl } from "../../utils/auth";
import ProfileModal from "../../components/common/ProfileModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("Weekly");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const orders = [
    {
      id: "#9812567",
      name: "Air Vapormax",
      status: "Complete",
      price: "$22.78",
      icon: "👟",
    },
    {
      id: "#9812411",
      name: "Canon EOS 1500D 24.1MP",
      status: "Pending",
      price: "$122.8",
      icon: "📷",
    },
    {
      id: "#9812556",
      name: "MI Backpack Black",
      status: "Canceled",
      price: "$15.99",
      icon: "🎒",
    },
    {
      id: "#9812619",
      name: "iPhone 12 128GB",
      status: "Complete",
      price: "$4022",
      icon: "📱",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f2ff] via-[#eae0fd] to-[#f3ebff] p-4 md:p-8 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ---------------- Top Navbar ---------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>

          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search"
                className="bg-white/80 backdrop-blur-md pl-4 pr-10 py-2 rounded-xl text-sm border border-purple-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
              />
              <button
                aria-label="Search"
                className="absolute right-1 bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View Homepage Quick Link */}
            <button
              onClick={() => navigate("/")}
              title="Go to User Homepage"
              className="hidden sm:flex items-center gap-2 bg-white/80 hover:bg-white text-slate-800 px-3 py-1.5 rounded-xl border border-purple-100 shadow-sm text-xs font-semibold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>View Website</span>
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
              <span className="text-xs font-semibold text-slate-700">
                {user?.name || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------- Main Dashboard Grid Layout ---------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT CONTENT COLUMN (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat 1 */}
              <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between">
                <div>
                  <div className="p-2 bg-blue-100 text-blue-500 rounded-xl w-fit mb-3">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">2341+</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Sales Products
                  </p>
                </div>
                {/* Circular Progress Ring */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray="113"
                      strokeDashoffset="22"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-blue-600">
                    80%
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between">
                <div>
                  <div className="p-2 bg-emerald-100 text-emerald-500 rounded-xl w-fit mb-3">
                    <Box className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">178+</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Stok Products
                  </p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#22c55e"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray="113"
                      strokeDashoffset="79"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-emerald-600">
                    30%
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-sm flex items-center justify-between">
                <div>
                  <div className="p-2 bg-rose-100 text-rose-500 rounded-xl w-fit mb-3">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">67+</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Return Products
                  </p>
                </div>
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#f43f5e"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray="113"
                      strokeDashoffset="90"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-rose-500">
                    20%
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Sales Reports SVG Line Chart */}
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-800 text-base">
                  Sales Reports
                </h2>
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
              <div className="h-48 w-full relative">
                {/* Y-Axis Guidelines */}
                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-300 font-medium pointer-events-none">
                  <div className="border-b border-slate-100 pb-1">100</div>
                  <div className="border-b border-slate-100 pb-1">80</div>
                  <div className="border-b border-slate-100 pb-1">60</div>
                  <div className="border-b border-slate-100 pb-1">40</div>
                  <div className="border-b border-slate-100 pb-1">20</div>
                  <div>0</div>
                </div>

                {/* SVG Curve Line */}
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 150"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0,110 Q 30,70 60,80 T 120,120 T 180,90 T 240,65 T 300,100 T 360,20 T 420,70 T 480,50"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="3"
                  />
                  {/* Active Tooltip Pin Point */}
                  <circle
                    cx="360"
                    cy="20"
                    r="5"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </svg>

                {/* Tooltip Overlay */}
                <div className="absolute left-[70%] top-[2%] -translate-x-1/2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-lg flex flex-col items-center">
                  <span className="text-slate-400 font-normal">Sales</span>
                  <span>3,672</span>
                </div>
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-4 px-2">
                <span>10am</span>
                <span>11am</span>
                <span>12am</span>
                <span>01am</span>
                <span>02am</span>
                <span>03am</span>
                <span>04am</span>
                <span>05am</span>
                <span>06am</span>
                <span>07am</span>
              </div>
            </div>

            {/* 3. Recent Orders Data Table */}
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 text-base">
                  Recent Order
                </h2>
                <button className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                  See more
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="pb-3 font-semibold">Tracking ID</th>
                      <th className="pb-3 font-semibold">Products name</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 font-medium text-slate-700">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-white/40 transition-colors"
                      >
                        <td className="py-3 text-slate-400 font-normal">
                          {order.id}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <span>{order.icon}</span>
                            <span>{order.name}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              order.status === "Complete"
                                ? "bg-blue-100 text-blue-600"
                                : order.status === "Pending"
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-rose-100 text-rose-500"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-800">
                          {order.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR COLUMN (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Donut Chart Card */}
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm flex flex-col items-center min-h-[260px]">
              <div className="w-full flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 text-base">
                  Sales Reports
                </h2>
                <button
                  aria-label="More options"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* CSS Conic Gradient Donut Ring */}
              <div
                className="relative w-44 h-44 rounded-full flex items-center justify-center my-2"
                style={{
                  background: `conic-gradient(#3b82f6 0% 70%, #f43f5e 70% 80%, #84cc16 80% 100%)`,
                }}
              >
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-3xl font-extrabold text-slate-800">
                    70%
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex justify-center items-center space-x-4 mt-6 text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-600">Sale</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
                  <span className="text-slate-600">Distribute</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-600">Return</span>
                </div>
              </div>
            </div>

            {/* Grouped Analytics Bar Chart Card */}
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-sm min-h-[420px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 text-base">
                  Analytics
                </h2>
                <button
                  aria-label="More options"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Bars Graphic */}
              <div className="mt-8 flex h-44 justify-between gap-2 px-2">
                {[
                  { day: "Sun", h1: "50%", h2: "70%" },
                  { day: "Mon", h1: "55%", h2: "40%" },
                  { day: "Tue", h1: "35%", h2: "85%" },
                  { day: "Wed", h1: "70%", h2: "90%" },
                  { day: "Thu", h1: "58%", h2: "30%" },
                  { day: "Fri", h1: "52%", h2: "42%" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative flex flex-1 flex-col items-center justify-end"
                  >
                    {item.day === "Tue" && (
                      <div className="absolute -top-7 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        2.33k
                      </div>
                    )}

                    <div className="flex h-full w-full items-end justify-center space-x-1">
                      <div
                        className="w-1.5 rounded-t-full bg-blue-300 sm:w-2"
                        style={{ height: item.h1 }}
                      ></div>
                      <div
                        className="w-1.5 rounded-t-full bg-blue-600 sm:w-2"
                        style={{ height: item.h2 }}
                      ></div>
                    </div>

                    <span className="mt-auto pt-2 text-[10px] font-medium text-slate-400">
                      {item.day}
                    </span>
                  </div>
                ))}
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
