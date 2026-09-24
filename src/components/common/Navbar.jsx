import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Calendar,
  Menu,
  X,
  Home,
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Properties", href: "#properties" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  const userName = user?.name || (isAdmin ? "Admin" : "User");
  const userEmail = user?.email || "";
  const avatarLabel = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1f3a]/95 text-white shadow-[0_8px_30px_rgba(11,31,58,0.18)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[76px] items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-3 transition-transform hover:scale-102"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#dcae4d] text-[#0b1f3a] shadow-[0_6px_18px_rgba(220,174,77,0.25)]">
              <Home className="h-5 w-5 fill-current" />
            </div>
            <div>
              <span className="block text-lg font-extrabold leading-tight tracking-tight text-white">
                Roomly
              </span>
              <span className="-mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dcae4d]">
                Find your place
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.href === "/") {
                    e.preventDefault();
                    navigate("/");
                  }
                  setActiveLink(link.name);
                }}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeLink === link.name
                    ? "bg-white text-[#0b1f3a] font-semibold shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <button
              aria-label="Wishlist"
              className="rounded-full border border-white/15 bg-white/5 p-2.5 text-slate-300 transition-all duration-200 hover:border-[#dcae4d] hover:bg-white/10 hover:text-[#dcae4d]"
            >
              <Heart className="w-4 h-4" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Admin Only: Quick access to Admin Dashboard */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-600/30 active:scale-95 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    aria-label="User profile"
                    className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-100 transition-all duration-200 hover:border-[#dcae4d] hover:bg-white/10 cursor-pointer"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcae4d] text-sm font-bold text-[#0b1f3a]">
                      {avatarLabel}
                    </span>
                    <span className="text-sm font-medium max-w-[120px] truncate">
                      {userName}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#08182e] border border-white/10 p-2 shadow-2xl backdrop-blur-xl z-50">
                      <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                        <p className="text-xs font-bold text-white truncate">
                          {userName}
                        </p>
                        {userEmail && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {userEmail}
                          </p>
                        )}
                        <span
                          className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAdmin
                              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {isAdmin ? "Administrator" : "Tenant"}
                        </span>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            navigate("/admin");
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 rounded-xl hover:bg-white/10 transition cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4 text-violet-400" />
                          <span>Admin Portal</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 rounded-xl hover:bg-red-500/10 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-full bg-[#dcae4d] px-5 py-2.5 text-sm font-bold text-[#0b1f3a] shadow-[0_8px_20px_rgba(220,174,77,0.2)] transition-all duration-200 hover:bg-[#ebc66e] hover:shadow-lg active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button className="flex items-center gap-2 rounded-full bg-[#dcae4d] px-5 py-2.5 text-sm font-bold text-[#0b1f3a] shadow-[0_8px_20px_rgba(220,174,77,0.2)] transition-all duration-200 hover:bg-[#ebc66e] hover:shadow-lg active:scale-95">
              <Calendar className="w-4 h-4" />
              <span>Schedule a Call</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              aria-label="Wishlist"
              className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-300 hover:text-[#dcae4d]"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="rounded-full border border-white/15 p-2 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="space-y-2 border-t border-white/10 bg-[#081a31] px-4 pb-6 pt-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                if (link.href === "/") {
                  e.preventDefault();
                  navigate("/");
                }
                setActiveLink(link.name);
                setMobileMenuOpen(false);
              }}
              className={`block rounded-xl px-4 py-3 text-base font-medium ${
                activeLink === link.name
                  ? "bg-white text-[#0b1f3a]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.name}
            </a>
          ))}

          <div className="flex flex-col space-y-3 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <>
                {/* Admin button for mobile */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/admin");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcae4d] text-sm font-bold text-[#0b1f3a]">
                      {avatarLabel}
                    </span>
                    <div>
                      <span className="block text-sm font-medium text-slate-100">
                        {userName}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {isAdmin ? "Admin" : "Tenant"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full rounded-full bg-[#dcae4d] px-4 py-3 text-sm font-bold text-[#0b1f3a]"
              >
                Sign In
              </button>
            )}

            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#dcae4d] py-3 text-sm font-bold text-[#0b1f3a] transition-all duration-200 hover:bg-[#ebc66e]">
              <Calendar className="w-4 h-4" />
              <span>Schedule a Call</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
