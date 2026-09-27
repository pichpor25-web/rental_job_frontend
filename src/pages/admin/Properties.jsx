import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  MapPin,
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
  Bed,
  Bath,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";
import { fetchProperties, deleteProperty } from "../../Api/propertyApi";
import { fetchUsers } from "../../Api/userApi";

const normalizeProperty = (property) => ({
  ...property,
  title: property.title || property.name || "Untitled Property",
  name: property.name || property.title || "Untitled Property",
  address: property.address || property.location || "No location provided",
  owner_id: property.owner_id ?? property.owner?.id ?? null,
  owner: property.owner || {
    id: property.owner_id ?? null,
    name: "Unassigned",
    email: "",
  },
  price: property.price ? Number(property.price) : 0,
  price_display: property.price_display || null,
  price_suffix: property.price_suffix || "/ mo",
  beds: property.beds ?? 0,
  baths: property.baths ?? 0,
  sqft: property.sqft ?? null,
  tag: property.tag || null,
  tag_color:
    property.tag_color || "bg-indigo-50 text-indigo-700 border-indigo-200",
  featured_image: property.featured_image || null,
});

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

export default function PropertyManagement() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState("ALL");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const [propsRes, usersRes] = await Promise.allSettled([
          fetchProperties(),
          fetchUsers(),
        ]);
        if (propsRes.status === "fulfilled") {
          const rows = Array.isArray(propsRes.value?.data)
            ? propsRes.value.data
            : (propsRes.value?.data?.data ?? []);
          setProperties(rows.map(normalizeProperty));
        }
        if (usersRes.status === "fulfilled") {
          const uList = Array.isArray(usersRes.value?.data)
            ? usersRes.value.data
            : (usersRes.value?.data?.data ?? []);
          setOwners(uList.map((u) => ({ id: u.id, name: u.name || u.email })));
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setProperties([]);
        showToast("error", "Couldn't load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
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

  const totalProperties = properties.length;
  const uniqueOwners = new Set(
    properties.map((p) => p.owner_id).filter(Boolean),
  ).size;

  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return properties.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const address = (p.address || "").toLowerCase();
      const matchesSearch = !q || title.includes(q) || address.includes(q);
      const matchesOwner =
        selectedOwner === "ALL" || String(p.owner_id) === selectedOwner;
      return matchesSearch && matchesOwner;
    });
  }, [properties, searchQuery, selectedOwner]);

  const handleDelete = async (property) => {
    if (!confirm(`Delete "${property.title}"? This cannot be undone.`)) return;

    try {
      setDeletingId(property.id);
      await deleteProperty(property.id);
      setProperties((prev) => prev.filter((p) => p.id !== property.id));
      setActiveMenuId(null);
      showToast("success", `"${property.title}" was deleted.`);
    } catch (error) {
      console.error("Failed to delete property:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to delete property.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Property Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage listings, pricing, specs, tags, and ownership.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/properties/add")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <StatCard
            label="Total Properties"
            value={loading ? "—" : totalProperties}
            icon={Building2}
            tint="bg-indigo-50 text-indigo-600"
            trend="+12% from last month"
          />
          <StatCard
            label="Active Owners"
            value={loading ? "—" : uniqueOwners}
            icon={Users}
            tint="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Filtered Results"
            value={loading ? "—" : filteredProperties.length}
            icon={MapPin}
            tint="bg-violet-50 text-violet-600"
          />
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, address, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">All Owners</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            <button className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Address / Location</th>
                  <th className="py-3 px-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-5 w-10 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                          <div className="space-y-1.5">
                            <div className="h-4 w-32 bg-slate-100 rounded" />
                            <div className="h-3 w-20 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-36 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4 text-right" />
                    </tr>
                  ))
                ) : filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <tr
                      key={property.id}
                      className="hover:bg-slate-50/60 transition duration-150"
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-medium text-slate-900">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          #{property.id}
                        </span>
                      </td>

                      {/* Property Image + Title/Name + Tag + Owner */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {property.featured_image ? (
                            <img
                              src={property.featured_image}
                              alt={property.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 truncate max-w-[14rem]">
                                {property.title}
                              </span>
                              {property.tag && (
                                <span
                                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                    property.tag_color ||
                                    "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  }`}
                                >
                                  {property.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                              Owner: {property.owner?.name || "Unassigned"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price / Price Display */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">
                          {property.price_display
                            ? property.price_display
                            : `$${Number(property.price).toLocaleString()}`}
                        </div>
                        {!property.price_display && property.price_suffix && (
                          <div className="text-xs text-slate-400 font-normal">
                            {property.price_suffix}
                          </div>
                        )}
                      </td>

                      {/* Beds / Baths / Sqft */}
                      <td className="py-4 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-flex items-center gap-1"
                            title={`${property.beds} Bedrooms`}
                          >
                            <Bed className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700">
                              {property.beds}
                            </span>
                            <span className="text-slate-400">bd</span>
                          </span>
                          <span
                            className="inline-flex items-center gap-1"
                            title={`${property.baths} Bathrooms`}
                          >
                            <Bath className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700">
                              {property.baths}
                            </span>
                            <span className="text-slate-400">ba</span>
                          </span>
                          {property.sqft && (
                            <span
                              className="inline-flex items-center gap-1"
                              title={`${property.sqft} sq ft`}
                            >
                              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium text-slate-700">
                                {property.sqft}
                              </span>
                              <span className="text-slate-400">sqft</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location / Address */}
                      <td className="py-4 px-4 max-w-xs text-slate-600 text-xs">
                        <div
                          className="truncate flex items-center gap-1.5"
                          title={property.address}
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 pr-6 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === property.id ? null : property.id,
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        >
                          {deletingId === property.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <MoreHorizontal className="w-5 h-5" />
                          )}
                        </button>

                        {activeMenuId === property.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="origin-top-right absolute right-6 mt-2 w-44 rounded-xl bg-white shadow-lg border border-slate-100 py-1 z-20"
                          >
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/properties/view/${property.id}`,
                                )
                              }
                              className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/properties/edit/${property.id}`,
                                )
                              }
                              className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Property
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              onClick={() => handleDelete(property)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <Building2 className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        {properties.length === 0
                          ? "No properties yet."
                          : "No properties match your filter criteria."}
                      </p>
                      {properties.length === 0 ? (
                        <button
                          onClick={() => navigate("/admin/properties/add")}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="w-4 h-4" /> Add your first property
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedOwner("ALL");
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
                  {filteredProperties.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalProperties}
                </span>{" "}
                properties
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
