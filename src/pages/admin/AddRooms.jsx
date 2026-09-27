import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BedSingle,
  Building2,
  FileText,
  DollarSign,
  ArrowLeft,
  Loader2,
  Tag,
  Bath,
  Maximize2,
  Users,
  Image as ImageIcon,
  CheckSquare,
  Plus,
  Trash2,
  X,
  Layers,
} from "lucide-react";
import { createRoom } from "../../Api/roomApi";
import { fetchProperties } from "../../Api/propertyApi";

const PRESET_BADGE_COLORS = [
  { label: "Indigo", value: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "Emerald", value: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Amber", value: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Rose", value: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "Sky", value: "bg-sky-50 text-sky-700 border-sky-200" },
  { label: "Violet", value: "bg-violet-50 text-violet-700 border-violet-200" },
];

const DEFAULT_PERKS = [
  "Balcony",
  "Private Bathroom",
  "City View",
  "High-Speed WiFi",
  "Air Conditioning",
  "Smart TV",
  "Work Desk",
  "Mini Fridge",
  "Soundproof",
  "Kitchenette",
];

const ROOM_STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "rented", label: "Rented" },
];

const BED_TYPES = [
  "Single Bed",
  "Twin Beds",
  "Double Bed",
  "Queen Bed",
  "King Bed",
  "Bunk Bed",
];

const ROOM_TYPES = [
  "Studio",
  "Single Room",
  "Deluxe Suite",
  "Master Bedroom",
  "Double Room",
  "Penthouse",
];

const EMPTY_FORM = {
  property_id: "",
  room_number: "",
  name: "",
  badge: "",
  badge_color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  room_type: "Studio",
  price: "",
  deposit: "",
  max_guests: "2",
  bed_type: "Queen Bed",
  bathrooms: "1",
  sqft: "",
  available_count: "1",
  status: "available",
  perks: [],
  description: "",
};

const FALLBACK_PROPERTIES = [
  { id: 1, name: "Property One" },
  { id: 2, name: "Property Two" },
];

function responseData(response) {
  return response?.data?.data || response?.data || response;
}

export default function AddRoomPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [customPerk, setCustomPerk] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState(FALLBACK_PROPERTIES);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      try {
        setLoadingProperties(true);
        const response = await fetchProperties();
        const rawProps = responseData(response);

        const mappedProperties = (Array.isArray(rawProps) ? rawProps : [])
          .filter((prop) => prop && prop.id)
          .map((prop) => ({
            id: Number(prop.id),
            name: prop.name || prop.title || `Property ${prop.id}`,
          }));

        if (isMounted) {
          setProperties(
            mappedProperties.length ? mappedProperties : FALLBACK_PROPERTIES
          );
        }
      } catch (error) {
        console.warn("Failed to fetch properties, using fallback list.", error);
        if (isMounted) {
          setProperties(FALLBACK_PROPERTIES);
        }
      } finally {
        if (isMounted) {
          setLoadingProperties(false);
        }
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Image handlers
  const handleImageFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setNewImageFiles((previous) => [...previous, ...files]);
    setNewImagePreviews((previous) => [
      ...previous,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    event.target.value = "";
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
    setNewImagePreviews((previews) => previews.filter((_, previewIndex) => previewIndex !== index));
  };

  // Perks handlers
  const togglePerk = (item) => {
    setFormData((prev) => {
      const exists = prev.perks.includes(item);
      return {
        ...prev,
        perks: exists
          ? prev.perks.filter((p) => p !== item)
          : [...prev.perks, item],
      };
    });
  };

  const handleAddCustomPerk = () => {
    const trimmed = customPerk.trim();
    if (!trimmed) return;
    if (!formData.perks.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        perks: [...prev.perks, trimmed],
      }));
    }
    setCustomPerk("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.property_id) newErrors.property_id = "Please select a property";
    if (!String(formData.room_number).trim()) newErrors.room_number = "Room number is required";
    if (!String(formData.room_type).trim()) newErrors.room_type = "Room type is required";
    if (formData.price === "" || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = "Valid price is required";
    }
    if (formData.deposit !== "" && (isNaN(Number(formData.deposit)) || Number(formData.deposit) < 0)) {
      newErrors.deposit = "Deposit cannot be negative";
    }
    if (formData.max_guests !== "" && (isNaN(Number(formData.max_guests)) || Number(formData.max_guests) < 1)) {
      newErrors.max_guests = "Must allow at least 1 guest";
    }
    if (formData.available_count !== "" && (isNaN(Number(formData.available_count)) || Number(formData.available_count) < 0)) {
      newErrors.available_count = "Available count cannot be negative";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        property_id: Number(formData.property_id),
        room_number: formData.room_number.trim(),
        name: formData.name.trim() || formData.room_number.trim(),
        badge: formData.badge.trim() || null,
        badge_color: formData.badge_color.trim() || null,
        room_type: formData.room_type.trim(),
        price: parseFloat(formData.price),
        deposit: formData.deposit !== "" ? parseFloat(formData.deposit) : 0,
        max_guests: formData.max_guests !== "" ? parseInt(formData.max_guests, 10) : 1,
        bed_type: formData.bed_type.trim() || null,
        bathrooms: formData.bathrooms !== "" ? formData.bathrooms : "1",
        sqft: formData.sqft !== "" ? parseInt(formData.sqft, 10) : null,
        perks: formData.perks,
        available_count: formData.available_count !== "" ? parseInt(formData.available_count, 10) : 1,
        status: formData.status,
        description: formData.description.trim() || null,
      };

      if (newImageFiles.length > 0) {
        const data = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            data.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
          }
        });
        newImageFiles.forEach((file) => data.append("images[]", file));
        await createRoom(data);
      } else {
        await createRoom(payload);
      }
      navigate("/admin/rooms");
    } catch (error) {
      console.error("Failed to create room:", error);
      alert(error?.response?.data?.message || "Failed to create room unit.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium transition focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
      errors[fieldName] ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/admin/rooms"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rooms</span>
        </Link>

        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <BedSingle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Room Unit</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Configure room specifications, pricing, inventory count, perks, and media.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Property & Basic Unit Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Property & Room Identity
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Property Assignment <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="property_id"
                    value={formData.property_id}
                    onChange={handleInputChange}
                    disabled={loadingProperties}
                    className={`${inputClass("property_id")} appearance-none`}
                  >
                    <option value="">Select a property</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.name}
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.property_id && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.property_id}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Room Number / Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleInputChange}
                    placeholder="e.g. 101, A-204"
                    className={inputClass("room_number")}
                  />
                  {errors.room_number && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.room_number}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Room Name / Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Sunset Executive Suite"
                    className={inputClass("name")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Room Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="room_type"
                    list="room-types"
                    value={formData.room_type}
                    onChange={handleInputChange}
                    placeholder="Select or type..."
                    className={inputClass("room_type")}
                  />
                  <datalist id="room-types">
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                  {errors.room_type && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.room_type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Badge Text (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={handleInputChange}
                      placeholder="e.g. Popular, Best Value"
                      className={inputClass("badge")}
                    />
                    <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Badge Color
                  </label>
                  <select
                    name="badge_color"
                    value={formData.badge_color}
                    onChange={handleInputChange}
                    className={inputClass("badge_color")}
                  >
                    {PRESET_BADGE_COLORS.map((c) => (
                      <option key={c.label} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Pricing & Availability */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pricing, Status & Inventory
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Monthly Rent ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={inputClass("price")}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Deposit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={inputClass("deposit")}
                  />
                  {errors.deposit && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.deposit}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Available Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="available_count"
                    value={formData.available_count}
                    onChange={handleInputChange}
                    placeholder="1"
                    className={inputClass("available_count")}
                  />
                  {errors.available_count && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.available_count}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={inputClass("status")}
                  >
                    {ROOM_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Specifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Room Specifications
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Max Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="max_guests"
                    value={formData.max_guests}
                    onChange={handleInputChange}
                    placeholder="2"
                    className={inputClass("max_guests")}
                  />
                  {errors.max_guests && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.max_guests}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <BedSingle className="w-3.5 h-3.5 text-slate-400" /> Bed Type
                  </label>
                  <input
                    type="text"
                    name="bed_type"
                    list="bed-types"
                    value={formData.bed_type}
                    onChange={handleInputChange}
                    placeholder="e.g. Queen Bed"
                    className={inputClass("bed_type")}
                  />
                  <datalist id="bed-types">
                    {BED_TYPES.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-slate-400" /> Bathrooms
                  </label>
                  <input
                    type="text"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    placeholder="1 Private Bath"
                    className={inputClass("bathrooms")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> Sqft
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    placeholder="e.g. 350"
                    className={inputClass("sqft")}
                  />
                </div>
              </div>
            </div>

            {/* 4. Images Gallery */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Room Images
                </span>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                <ImageIcon className="w-4 h-4 text-indigo-600" /> Upload room photos
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImageFiles}
                />
              </label>

              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {newImagePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-24"
                    >
                      <img
                        src={preview}
                        alt={`Room photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Perks & Amenities */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Perks & Room Features
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DEFAULT_PERKS.map((item) => {
                  const isChecked = formData.perks.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => togglePerk(item)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium text-left transition ${
                        isChecked
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                      />
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={customPerk}
                  onChange={(e) => setCustomPerk(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomPerk();
                    }
                  }}
                  placeholder="Custom perk (e.g. Espresso Machine)..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPerk}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {formData.perks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.perks.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => togglePerk(item)}
                        className="hover:text-red-500 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Overview of room amenities, layout, view, and specific unit policies..."
                className={`${inputClass("description")} resize-none`}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                to="/admin/rooms"
                className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Room</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
