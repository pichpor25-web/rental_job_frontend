import React, { useState } from "react";
import {
  Home,
  Building2,
  Users,
  PlusCircle,
  BarChart3,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const menuGroups = [
    {
      title: "Main Menu",
      items: [
        { name: "Dashboard", icon: Home, badge: null },
        { name: "Properties", icon: Building2, badge: "24" },
        { name: "Add Listing", icon: PlusCircle, badge: "New" },
        { name: "Agents", icon: Users, badge: null },
      ],
    },
    {
      title: "Analytics & Client",
      items: [
        { name: "Analytics", icon: BarChart3, badge: null },
        { name: "Saved Homes", icon: Heart, badge: "8" },
        { name: "Messages", icon: MessageSquare, badge: "5" },
      ],
    },
    {
      title: "Preferences",
      items: [{ name: "Settings", icon: Settings, badge: null }],
    },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen bg-[#0b1f3a] text-white flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* ---------------- Collapse Toggle Button ---------------- */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-8 bg-[#134074] hover:bg-[#1d5494] text-white p-1.5 rounded-full border-2 border-white shadow-md transition-transform duration-200 active:scale-90 z-50"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* ---------------- Top Section (Brand Logo) ---------------- */}
      <div className="px-5 py-6 flex items-center space-x-3 border-b border-gray-800/80">
        <div className="p-2.5 bg-[#134074] rounded-xl text-white shrink-0 shadow-lg">
          <Shield className="w-6 h-6 fill-current text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h2 className="font-extrabold text-lg tracking-tight text-white leading-none">
              RealEstate
            </h2>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-1">
              Admin Portal
            </p>
          </div>
        )}
      </div>

      {/* ---------------- Navigation Menu Items ---------------- */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {/* Group Title (Only visible when expanded) */}
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {group.title}
              </p>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.name;

                return (
                  <li key={item.name}>
                    <button
                      onClick={() => setActiveItem(item.name)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                        isActive
                          ? "bg-[#134074] text-white shadow-md"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-gray-400 group-hover:text-white"
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>

                      {/* Badge Counter / Tag */}
                      {!collapsed && item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.badge === "New"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isActive
                                ? "bg-white text-[#0b1f3a]"
                                : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active Left Indicator Strip */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* ---------------- Bottom User Profile Footer ---------------- */}
      <div className="p-3 border-t border-gray-800/80 bg-[#08182e]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-700"
            />
            {!collapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-xs font-bold text-white truncate">
                  Sarah Jenkins
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  sarah@realestate.com
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              aria-label="Log Out"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
