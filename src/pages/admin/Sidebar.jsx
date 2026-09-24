import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  BedDouble,
  Image as ImageIcon,
  FileText,
  KeyRound,
  Users as UsersIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
  Globe,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAvatarUrl } from "../../utils/auth";
import ProfileModal from "../../components/common/ProfileModal";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const menuGroups = [
    {
      title: "Main Menu",
      items: [
        { name: "Dashboard", icon: Home, path: "/admin/dashboard" },
        { name: "Users", icon: UsersIcon, path: "/admin/users" },
        { name: "Properties", icon: Building2, path: "/admin/properties" },
        { name: "Rooms", icon: BedDouble, path: "/admin/rooms" },
        { name: "Room Images", icon: ImageIcon, path: "/admin/roomimage" },
      ],
    },
    {
      title: "Rentals & Bookings",
      items: [
        {
          name: "Rental Requests",
          icon: FileText,
          path: "/admin/rentalrequest",
        },
        { name: "Rentals", icon: KeyRound, path: "/admin/rental" },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const adminName = user?.name || "Admin";
  const adminEmail = user?.email || "admin@roomly.com";
  const avatarLetter = adminName.charAt(0).toUpperCase();
  const avatarSrc = getAvatarUrl(user);

  return (
    <>
      <aside
        className={`sticky top-0 h-screen bg-[#0b1f3a] text-white flex flex-col justify-between transition-all duration-300 ease-in-out shadow-2xl z-40 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-8 bg-[#134074] hover:bg-[#1d5494] text-white p-1.5 rounded-full border-2 border-white shadow-md transition-transform duration-200 active:scale-90 z-50 cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <div>
          <div className="px-5 py-6 flex items-center space-x-3 border-b border-gray-800/80">
            <div
              onClick={() => navigate("/admin/dashboard")}
              className="p-2.5 bg-[#134074] rounded-xl text-white shrink-0 shadow-lg cursor-pointer"
            >
              <Shield className="w-6 h-6 fill-current text-white" />
            </div>
            {!collapsed && (
              <div
                onClick={() => navigate("/admin/dashboard")}
                className="overflow-hidden whitespace-nowrap cursor-pointer"
              >
                <h2 className="font-extrabold text-lg tracking-tight text-white leading-none">
                  Roomly Admin
                </h2>
                <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-1">
                  Management Portal
                </p>
              </div>
            )}
          </div>

          <div className="px-3 pt-4">
            <button
              onClick={() => navigate("/")}
              title="View User Homepage"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 active:scale-98 cursor-pointer ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                {!collapsed && <span>View User Website</span>}
              </div>
              {!collapsed && (
                <ExternalLink className="w-3.5 h-3.5 text-amber-400/80" />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {group.title}
                </p>
              )}

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === "/admin/dashboard"
                      ? location.pathname === "/admin" ||
                        location.pathname === "/admin/dashboard"
                      : location.pathname.startsWith(item.path);

                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => navigate(item.path)}
                        title={collapsed ? item.name : undefined}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 group relative cursor-pointer ${
                          isActive
                            ? "bg-[#134074] text-white shadow-md font-bold"
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

                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-800/80 bg-[#08182e]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div
              onClick={() => setProfileModalOpen(true)}
              title="Click to view/edit profile"
              className="flex items-center space-x-3 overflow-hidden cursor-pointer flex-1 mr-1"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={adminName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-amber-400/50 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#dcae4d] text-[#0b1f3a] font-bold text-sm flex items-center justify-center shrink-0 border border-amber-400/40 shadow-sm">
                  {avatarLetter}
                </div>
              )}
              {!collapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <p className="text-xs font-bold text-white truncate hover:text-amber-300 transition">
                    {adminName}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {adminEmail}
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                aria-label="Log Out"
                title="Sign Out"
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
