import React, { useState } from "react";
import {
  Home,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Star,
  Send,
  Lock,
} from "lucide-react";

// Crisp inline SVGs for popular social platforms
const SocialIcons = {
  Facebook: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  ),
  XTwitter: () => (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Instagram: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  Telegram: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
    </svg>
  ),
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const rentalCategories = [
    { label: "Studio Apartments", href: "#properties", count: "120+ Listings" },
    { label: "Single Private Rooms", href: "#properties", count: "340+ Listings" },
    { label: "Shared Co-Living Flats", href: "#properties", count: "85+ Listings" },
    { label: "Luxury Penthouse Suites", href: "#properties", count: "42+ Listings" },
    { label: "Student Accommodations", href: "#properties", count: "190+ Listings" },
    { label: "Pet-Friendly Rentals", href: "#properties", count: "65+ Listings" },
  ];

  const quickLinks = [
    { label: "Browse Properties", href: "#properties" },
    { label: "How Roomly Works", href: "#services" },
    { label: "Why Choose Us", href: "#about" },
    { label: "Tenant Protection Policy", href: "#privacy" },
    { label: "Pricing & Deposit Guide", href: "#services" },
    { label: "List Your Property (Host)", href: "/register" },
  ];

  return (
    <footer className="relative bg-[#07162c] text-white overflow-hidden border-t border-white/10 selection:bg-[#dcae4d] selection:text-[#0b1f3a]">
      {/* Background Ambience Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#dcae4d]/5 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 right-10 h-96 w-96 rounded-full bg-[#134074]/30 blur-3xl"></div>

      <div className="relative mx-auto max-w-[1340px] px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* 1. TOP NEWSLETTER & VIP CTA CARD                          */}
        {/* ========================================================= */}
        <div className="pt-12 sm:pt-16 pb-12 border-b border-white/10">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-[#0b1f3a] via-[#102d53] to-[#0b1f3a] p-8 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(7,22,44,0.6)]">
            {/* Decorative pattern accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-[#dcae4d]/10 blur-2xl"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Headline & Description */}
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#dcae4d]/30 bg-[#dcae4d]/10 px-3.5 py-1 text-xs font-bold text-[#dcae4d] uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>VIP Rental Access</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Be the First to Know When <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dcae4d] via-[#f7d688] to-[#dcae4d]">
                    New Rooms & Price Drops Hit
                  </span>
                </h3>
                <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                  Join 15,000+ happy tenants who receive instant updates on verified rooms, seasonal discounts, and lease recommendations directly in their inbox.
                </p>
              </div>

              {/* Subscription Form */}
              <div className="lg:col-span-5">
                <form
                  onSubmit={handleSubscribe}
                  className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-[#07162c]/80 p-2 rounded-2xl border border-white/15 shadow-inner"
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full rounded-xl bg-transparent py-3 pl-11 pr-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#dcae4d] px-6 py-3 text-xs sm:text-sm font-bold text-[#0b1f3a] shadow-md transition-all duration-200 hover:bg-[#ebc66e] hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {subscribed && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400 animate-fadeIn">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Success! You've joined the Roomly VIP alert list.</span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#dcae4d]" />
                    Zero spam guaranteed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-[#dcae4d]" />
                    Unsubscribe anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MAIN 4-COLUMN FOOTER NAVIGATION                        */}
        {/* ========================================================= */}
        <div className="py-14 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 border-b border-white/10">
          {/* Column 1: Brand & Social (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dcae4d] text-[#0b1f3a] shadow-[0_8px_20px_rgba(220,174,77,0.3)]">
                <Home className="h-6 w-6 fill-current" />
              </div>
              <div>
                <span className="block text-xl font-extrabold leading-tight tracking-tight text-white">
                  Roomly
                </span>
                <span className="-mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#dcae4d]">
                  Find your place
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              Roomly is Cambodia’s premier room and rental apartment platform. We make renting effortless with verified properties, transparent agreements, and continuous tenant support.
            </p>

            {/* Trust Rating Pill */}
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
              <div className="flex text-[#dcae4d]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#dcae4d] text-[#dcae4d]" />
                ))}
              </div>
              <div className="border-l border-white/15 pl-3">
                <p className="text-xs font-bold text-white leading-none">
                  4.9 / 5.0
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Over 1,200+ verified renter reviews
                </p>
              </div>
            </div>

            {/* Social Media Pill Buttons */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Connect With Us
              </p>
              <div className="flex items-center gap-2.5 text-slate-300">
                {[
                  { name: "Facebook", icon: SocialIcons.Facebook, href: "#facebook" },
                  { name: "X Twitter", icon: SocialIcons.XTwitter, href: "#twitter" },
                  { name: "Instagram", icon: SocialIcons.Instagram, href: "#instagram" },
                  { name: "LinkedIn", icon: SocialIcons.LinkedIn, href: "#linkedin" },
                  { name: "Telegram", icon: SocialIcons.Telegram, href: "#telegram" },
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      aria-label={social.name}
                      className="group grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 transition-all duration-200 hover:border-[#dcae4d] hover:bg-[#dcae4d] hover:text-[#0b1f3a] hover:scale-105 active:scale-95"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Rental Categories (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#dcae4d]"></span>
              <span>Popular Rentals</span>
            </h4>
            <ul className="space-y-2.5">
              {rentalCategories.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group flex items-center justify-between text-xs sm:text-sm text-slate-300 hover:text-white transition-colors py-1"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 group-hover:text-[#dcae4d] transition-colors">
                      {item.count}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links & Resources (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#dcae4d]"></span>
              <span>Navigation</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-block hover:text-[#dcae4d] hover:translate-x-1 transition-all duration-200 py-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Office Info (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#dcae4d]"></span>
              <span>Headquarters</span>
            </h4>
            
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 shrink-0 text-[#dcae4d]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="leading-snug">
                  <p className="font-semibold text-white">Roomly Office Tower</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preah Monivong Blvd, Sangkat Boeung Keng Kang 1, Phnom Penh, Cambodia
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 shrink-0 text-[#dcae4d]">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <a
                    href="tel:+85523888999"
                    className="font-semibold text-white hover:text-[#dcae4d] transition-colors"
                  >
                    +855 (0) 23 888 999
                  </a>
                  <p className="text-[10px] text-slate-400">Available Mon - Sat (8am - 7pm)</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 shrink-0 text-[#dcae4d]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <a
                    href="mailto:support@roomly.com"
                    className="font-semibold text-white hover:text-[#dcae4d] transition-colors"
                  >
                    support@roomly.com
                  </a>
                  <p className="text-[10px] text-slate-400">24/7 Response for urgent issues</p>
                </div>
              </div>

              {/* Live Operational Status */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>All Booking Services Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. SUB-FOOTER: LEGAL, PAYMENT BADGES & BACK TO TOP        */}
        {/* ========================================================= */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          {/* Copyright & Entity */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-slate-200">Roomly Technologies Inc.</span> All rights reserved.
            </p>
            <span className="hidden sm:inline text-white/20">•</span>
            <p className="text-[11px] text-slate-500">
              Registered in Cambodia under MoC No. 00089211
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-xs">
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="hover:text-white transition-colors">
              Cookie Preferences
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Trust &amp; Safety
            </a>
          </div>

          {/* Back to Top Button */}
          <div>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-all duration-200 hover:border-[#dcae4d] hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
            >
              <span>Back to top</span>
              <ChevronUp className="h-3.5 w-3.5 text-[#dcae4d]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

