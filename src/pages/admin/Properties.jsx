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
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../../Api/propertyApi";

const OWNERS = [
  { id: "101", name: "Sarah Johnson" },
  { id: "102", name: "Michael Chen" },
  { id: "103", name: "Emily Davis" },
];

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

const avatarColor = (seed) => {
  const s = String(seed ?? "");
  let hash = 0;
  for (let i = 0; i < s.length; i++)
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeProperty = (property) => ({
  ...property,
  owner_id: property.owner_id ?? property.owner?.id ?? null,
  owner: property.owner || {
    id: property.owner_id ?? null,
    name: "Unassigned",
    email: "",
  },
  rooms_count: property.rooms_count ?? property.rooms?.length ?? 0,
  latitude: toNumberOrNull(property.latitude),
  longitude: toNumberOrNull(property.longitude),
});

const EMPTY_FORM = {
  name: "",
  description: "",
  address: "",
  latitude: "",
  longitude: "",
  owner_id: "",
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

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
      {children}
    </label>
  );
}

function PropertyForm({ formData, onChange, readOnly, errors }) {
  const inputClass = (field) =>
    `w-full px-3.5 py-2.5 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
      errors?.[field] ? "border-red-300" : "border-slate-200"
    }`;

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Property Name</FieldLabel>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={onChange}
          disabled={readOnly}
          placeholder="e.g. Grand Horizon Heights"
          className={inputClass("name")}
        />
        {errors?.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Owner</FieldLabel>
          <select
            name="owner_id"
            required
            value={formData.owner_id}
            onChange={onChange}
            disabled={readOnly}
            className={inputClass("owner_id")}
          >
            <option value="">Select owner</option>
            {OWNERS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Address</FieldLabel>
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={onChange}
            disabled={readOnly}
            placeholder="Full street address"
            className={inputClass("address")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Latitude</FieldLabel>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={onChange}
            disabled={readOnly}
            placeholder="37.7749"
            className={inputClass("latitude")}
          />
        </div>
        <div>
          <FieldLabel>Longitude</FieldLabel>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={onChange}
            disabled={readOnly}
            placeholder="-122.4194"
            className={inputClass("longitude")}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={onChange}
          disabled={readOnly}
          placeholder="Brief details about the property..."
          className={`${inputClass("description")} resize-none`}
        />
      </div>
    </div>
  );
}

export default function PropertyManagement() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [propertyModalMode, setPropertyModalMode] = useState("view");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        const response = await fetchProperties();
        const rows = Array.isArray(response?.data)
          ? response.data
          : (response?.data?.data ?? []);
        setProperties(rows.map(normalizeProperty));
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

  // Stats
  const totalProperties = properties.length;
  const uniqueOwners = new Set(
    properties.map((p) => p.owner_id).filter(Boolean),
  ).size;
  const totalMapped = properties.filter(
    (p) =>
      Number.isFinite(Number(p.latitude)) &&
      Number.isFinite(Number(p.longitude)),
  ).length;

  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return properties.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const address = (p.address || "").toLowerCase();
      const matchesSearch = !q || name.includes(q) || address.includes(q);
      const matchesOwner =
        selectedOwner === "ALL" || String(p.owner_id) === selectedOwner;
      return matchesSearch && matchesOwner;
    });
  }, [properties, searchQuery, selectedOwner]);

  const validate = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = "Property name is required";
    if (!data.address.trim()) errors.address = "Address is required";
    if (!data.owner_id) errors.owner_id = "Owner is required";
    if (data.latitude && Math.abs(Number(data.latitude)) > 90)
      errors.latitude = "Latitude must be between -90 and 90";
    if (data.longitude && Math.abs(Number(data.longitude)) > 180)
      errors.longitude = "Longitude must be between -180 and 180";
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    const errors = validate(formData);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        owner_id: Number(formData.owner_id),
      };

      const response = await createProperty(payload);
      const createdProperty = normalizeProperty(
        response?.data?.data ?? response?.data ?? payload,
      );
      setProperties((prev) => [createdProperty, ...prev]);
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
      setFormErrors({});
      showToast("success", `"${createdProperty.name}" was added.`);
    } catch (error) {
      console.error("Failed to create property:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to create property.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openPropertyModal = (mode, property) => {
    const normalized = normalizeProperty(property);
    setSelectedProperty(normalized);
    setPropertyModalMode(mode);
    setFormErrors({});
    setFormData({
      name: normalized.name || "",
      description: normalized.description || "",
      address: normalized.address || "",
      latitude: normalized.latitude ?? "",
      longitude: normalized.longitude ?? "",
      owner_id: normalized.owner_id ? String(normalized.owner_id) : "",
    });
    setPropertyModalOpen(true);
    setActiveMenuId(null);
  };

  const closePropertyModal = () => {
    setPropertyModalOpen(false);
    setSelectedProperty(null);
    setPropertyModalMode("view");
    setFormErrors({});
    setFormData(EMPTY_FORM);
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;
    const errors = validate(formData);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        owner_id: Number(formData.owner_id),
      };

      const response = await updateProperty(selectedProperty.id, payload);
      const updatedProperty = normalizeProperty(
        response?.data?.data ??
          response?.data ?? { ...selectedProperty, ...payload },
      );

      setProperties((prev) =>
        prev.map((property) =>
          property.id === selectedProperty.id ? updatedProperty : property,
        ),
      );
      showToast("success", `"${updatedProperty.name}" was updated.`);
      closePropertyModal();
    } catch (error) {
      console.error("Failed to update property:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to update property.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (property) => {
    if (!confirm(`Delete "${property.name}"? This can't be undone.`)) return;

    try {
      setDeletingId(property.id);
      await deleteProperty(property.id);
      setProperties((prev) => prev.filter((p) => p.id !== property.id));
      setActiveMenuId(null);
      showToast("success", `"${property.name}" was deleted.`);
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Property Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage listings, locations, room allocations, and property owners.
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

        {/* Metric Cards */}
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
            label="Mapped Locations"
            value={loading ? "—" : totalMapped}
            icon={MapPin}
            tint="bg-violet-50 text-violet-600"
          />
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search property or address..."
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
              {OWNERS.map((o) => (
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

        {/* Properties Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Property</th>

                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Coordinates</th>
                  <th className="py-3 px-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-5 w-12 bg-slate-100 rounded-full" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-32 bg-slate-100 rounded" />
                            <div className="h-3 w-44 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-24 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-40 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-6 w-28 bg-slate-100 rounded-md" />
                      </td>
                      <td className="py-4 px-4" />
                    </tr>
                  ))
                ) : filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <tr
                      key={property.id}
                      className="hover:bg-slate-50/60 transition duration-150"
                    >
                      <td className="py-4 px-4 font-medium text-slate-900">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          #{property.id}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate max-w-[14rem]">
                              {property.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-xs">
                              {property.description ||
                                "No description provided"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs text-slate-600">
                        <div className="truncate" title={property.address}>
                          {property.address}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-slate-500">
                        {Number.isFinite(Number(property.latitude)) &&
                        Number.isFinite(Number(property.longitude)) ? (
                          <a
                            href={`https://maps.google.com/?q=${Number(property.latitude)},${Number(property.longitude)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                          >
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span>
                              {Number(property.latitude).toFixed(4)},{" "}
                              {Number(property.longitude).toFixed(4)}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic font-sans">
                            Not set
                          </span>
                        )}
                      </td>

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
