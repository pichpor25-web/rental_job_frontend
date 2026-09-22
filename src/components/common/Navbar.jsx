import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, User, Calendar, Menu, X, Home } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [authMode, setAuthMode] = useState("loggedOut");

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Properties", href: "#" },
    { name: "About", href: "#" },
    { name: "Services", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const isLoggedIn = authMode !== "loggedOut";
  const isAdmin = authMode === "admin";
  const userName = isAdmin ? "Admin" : "John";
  const avatarLabel = userName.charAt(0).toUpperCase();

  return (
    <>
      <div className="border-b border-slate-200 bg-slate-100/90 px-4 py-2 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1340px] items-center justify-center gap-3 text-xs font-semibold sm:text-sm">
          <button
            type="button"
            onClick={() => setAuthMode("loggedOut")}
            className={`rounded-full px-3 py-1.5 transition ${
              authMode === "loggedOut"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 hover:bg-slate-200"
            }`}
          >
            Logged Out
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("user")}
            className={`rounded-full px-3 py-1.5 transition ${
              authMode === "user"
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-200"
            }`}
          >
            Regular User
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("admin")}
            className={`rounded-full px-3 py-1.5 transition ${
              authMode === "admin"
                ? "bg-violet-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-200"
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1f3a]/95 text-white shadow-[0_8px_30px_rgba(11,31,58,0.18)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[76px] items-center justify-between">
            <div className="flex cursor-pointer items-center gap-3">
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

            <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setActiveLink(link.name)}
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

            <div className="hidden items-center gap-3 lg:flex">
              <button
                aria-label="Wishlist"
                className="rounded-full border border-white/15 bg-white/5 p-2.5 text-slate-300 transition-all duration-200 hover:border-[#dcae4d] hover:bg-white/10 hover:text-[#dcae4d]"
              >
                <Heart className="w-4 h-4" />
              </button>

              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => navigate("/admin")}
                      className="rounded-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
                    >
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label="User profile"
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-slate-100 transition-all duration-200 hover:border-[#dcae4d] hover:bg-white/10 hover:text-[#dcae4d]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcae4d] text-sm font-bold text-[#0b1f3a]">
                      {avatarLabel}
                    </span>
                    <span className="text-sm font-medium">{userName}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-full bg-[#dcae4d] px-5 py-2.5 text-sm font-bold text-[#0b1f3a] shadow-[0_8px_20px_rgba(220,174,77,0.2)] transition-all duration-200 hover:bg-[#ebc66e] hover:shadow-lg active:scale-95"
                >
                  Sign In
                </button>
              )}

              <button className="flex items-center gap-2 rounded-full bg-[#dcae4d] px-5 py-3 text-sm font-bold text-[#0b1f3a] shadow-[0_8px_20px_rgba(220,174,77,0.2)] transition-all duration-200 hover:bg-[#ebc66e] hover:shadow-lg active:scale-95">
                <Calendar className="w-4 h-4" />
                <span>Schedule a Call</span>
              </button>
            </div>

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

        {mobileMenuOpen && (
          <div className="space-y-2 border-t border-white/10 bg-[#081a31] px-4 pb-6 pt-4 md:hidden">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => {
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
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => navigate("/admin")}
                      className="w-full rounded-full bg-violet-500 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcae4d] text-sm font-bold text-[#0b1f3a]">
                      {avatarLabel}
                    </span>
                    <span>{userName}</span>
                  </button>
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
    </>
  );
};

export default Navbar;
