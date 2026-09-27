import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  FileText,
  ArrowLeft,
  Loader2,
  Users,
  ShieldAlert,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  Tag,
  Image as ImageIcon,
  CheckSquare,
  Plus,
  Trash2,
  X,
  Layers,
  Upload,
} from "lucide-react";
import { fetchProperty, updateProperty } from "../../Api/propertyApi";
import { fetchUsers } from "../../Api/userApi";

const DEFAULT_AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Swimming Pool",
  "Gym",
  "Parking",
  "Security / 24/7 CCTV",
  "Furnished",
  "Balcony",
  "Pet Friendly",
  "Elevator",
];

const PRESET_TAG_COLORS = [
  { label: "Indigo", value: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "Emerald", value: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Amber", value: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Rose", value: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "Sky", value: "bg-sky-50 text-sky-700 border-sky-200" },
  { label: "Violet", value: "bg-violet-50 text-violet-700 border-violet-200" },
];

function responseData(response) {
  return response?.data?.data || response?.data || response;
}

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    tag: "",
    tag_color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    location: "",
    address: "",
    price: "",
    price_display: "",
    price_suffix: "/ mo",
    beds: "",
    baths: "",
    sqft: "",
    description: "",
    latitude: "",
    longitude: "",
    amenities: [],
  });

  // Owner state
  const [ownerInfo, setOwnerInfo] = useState({ name: "", email: "" });

  // File & Media state
  const [currentFeaturedUrl, setCurrentFeaturedUrl] = useState("");
  const [featuredFile, setFeaturedFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState("");

  const [existingGallery, setExistingGallery] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

  // Misc state
  const [customAmenity, setCustomAmenity] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      try {
        setLoading(true);
        setFetchError("");

        const res = await fetchProperty(id);
        const prop = responseData(res);

        if (!prop) throw new Error("Property record not found.");

        if (isMounted) {
          const parseArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === "string") {
              try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            }
            return [];
          };

          setFormData({
            title: prop.title || prop.name || "",
            name: prop.name || prop.title || "",
            tag: prop.tag || "",
            tag_color: prop.tag_color || "bg-indigo-50 text-indigo-700 border-indigo-200",
            location: prop.location || prop.address || "",
            address: prop.address || prop.location || "",
            price: prop.price !== null && prop.price !== undefined ? String(prop.price) : "",
            price_display: prop.price_display || "",
            price_suffix: prop.price_suffix || "/ mo",
            beds: prop.beds !== null && prop.beds !== undefined ? String(prop.beds) : "",
            baths: prop.baths !== null && prop.baths !== undefined ? String(prop.baths) : "",
            sqft: prop.sqft !== null && prop.sqft !== undefined ? String(prop.sqft) : "",
            description: prop.description || "",
            latitude: prop.latitude !== null && prop.latitude !== undefined ? String(prop.latitude) : "",
            longitude: prop.longitude !== null && prop.longitude !== undefined ? String(prop.longitude) : "",
            amenities: parseArray(prop.amenities),
          });

          setOwnerInfo({
            name: prop.owner_name || prop.owner?.name || "Assigned Owner",
            email: prop.owner_email || prop.owner?.email || "",
          });

          // Set featured image
          if (prop.featured_image) {
            setCurrentFeaturedUrl(prop.featured_image);
          }

          // Set gallery items
          const galleryData = parseArray(prop.gallery);
          setExistingGallery(
            galleryData.map((item) => (typeof item === "object" ? item.url : item))
          );
        }
      } catch (err) {
        console.error("Failed to load property:", err);
        if (isMounted) {
          setFetchError(err?.response?.data?.message || err.message || "Failed to load property.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title") updated.name = value;
      if (name === "location") updated.address = value;
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Featured Image File Select
  const handleFeaturedChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeaturedFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
  };

  // Gallery Files Select
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setNewGalleryFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewGalleryPreviews((prev) => [...prev, ...previews]);
  };

  const removeNewGalleryImage = (index) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index));
  };

  // Amenities handlers
  const toggleAmenity = (item) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== item)
          : [...prev.amenities, item],
      };
    });
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (!formData.amenities.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }));
    }
    setCustomAmenity("");
  };

  const validate = () => {
    const newErrors = {};
    if (!String(formData.title).trim()) newErrors.title = "Property Title is required";
    if (!String(formData.location).trim()) newErrors.location = "Location is required";
    if (formData.latitude && Math.abs(Number(formData.latitude)) > 90)
      newErrors.latitude = "Latitude must be between -90 and 90";
    if (formData.longitude && Math.abs(Number(formData.longitude)) > 180)
      newErrors.longitude = "Longitude must be between -180 and 180";
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

      // Build Multipart Form Data matching Laravel Controller expectations
      const data = new FormData();
      data.append("_method", "PUT"); // Method spoofing for Laravel RESTful API
      data.append("title", formData.title.trim());
      data.append("name", formData.name.trim() || formData.title.trim());
      data.append("location", formData.location.trim());
      data.append("address", formData.address.trim() || formData.location.trim());

      if (formData.tag) data.append("tag", formData.tag.trim());
      if (formData.tag_color) data.append("tag_color", formData.tag_color.trim());
      if (formData.price) data.append("price", formData.price);
      if (formData.price_display) data.append("price_display", formData.price_display.trim());
      if (formData.price_suffix) data.append("price_suffix", formData.price_suffix.trim());
      if (formData.beds) data.append("beds", formData.beds);
      if (formData.baths) data.append("baths", formData.baths);
      if (formData.sqft) data.append("sqft", formData.sqft);
      if (formData.latitude) data.append("latitude", formData.latitude);
      if (formData.longitude) data.append("longitude", formData.longitude);
      if (formData.description) data.append("description", formData.description.trim());

      // Amenities serialized as JSON
      data.append("amenities", JSON.stringify(formData.amenities));

      // Featured image (File upload if changed)
      if (featuredFile) {
        data.append("featured_image", featuredFile);
      }

      // New Gallery uploaded files
      newGalleryFiles.forEach((file) => {
        data.append("gallery[]", file);
      });

      // Submit via propertyApi update (configured for multipart or axios defaults)
      await updateProperty(id, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/admin/properties/view/${id}`);
    } catch (error) {
      console.error("Failed to update property:", error);
      alert(error?.response?.data?.message || "Failed to update property");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium transition focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
      errors[fieldName] ? "border-red-300" : "border-slate-200"
    }`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Unable to Edit Property</h2>
          <p className="text-sm text-slate-500 mb-6">{fetchError}</p>
          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-xs rounded-xl hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to={`/admin/properties/view/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Property</span>
        </Link>

        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Property #{id}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Owner: <span className="font-semibold text-slate-700">{ownerInfo.name}</span> ({ownerInfo.email})
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. General & Tag Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  General Information
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Skyline Luxury Villa"
                  className={inputClass("title")}
                />
                {errors.title && <p className="text-xs text-red-600 font-medium mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleInputChange}
                    placeholder="e.g. Featured, For Rent"
                    className={inputClass("tag")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tag Color Style
                  </label>
                  <select
                    name="tag_color"
                    value={formData.tag_color}
                    onChange={handleInputChange}
                    className={inputClass("tag_color")}
                  >
                    {PRESET_TAG_COLORS.map((c) => (
                      <option key={c.label} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Location & Coordinates */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location & Address
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Location Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. BKK1, Chamkarmon, Phnom Penh"
                    className={inputClass("location")}
                  />
                  {errors.location && <p className="text-xs text-red-600 font-medium mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. St 302, Building 45"
                    className={inputClass("address")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="11.5564"
                    className={inputClass("latitude")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="104.9282"
                    className={inputClass("longitude")}
                  />
                </div>
              </div>
            </div>

            {/* 3. Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pricing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1200.00"
                    className={inputClass("price")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Price Suffix
                  </label>
                  <input
                    type="text"
                    name="price_suffix"
                    value={formData.price_suffix}
                    onChange={handleInputChange}
                    placeholder="/ mo"
                    className={inputClass("price_suffix")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Display String
                  </label>
                  <input
                    type="text"
                    name="price_display"
                    value={formData.price_display}
                    onChange={handleInputChange}
                    placeholder="$1,200 / month"
                    className={inputClass("price_display")}
                  />
                </div>
              </div>
            </div>

            {/* 4. Specifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Specifications
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-slate-400" /> Beds
                  </label>
                  <input
                    type="number"
                    name="beds"
                    min="0"
                    value={formData.beds}
                    onChange={handleInputChange}
                    placeholder="2"
                    className={inputClass("beds")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-slate-400" /> Baths
                  </label>
                  <input
                    type="number"
                    name="baths"
                    min="0"
                    value={formData.baths}
                    onChange={handleInputChange}
                    placeholder="1"
                    className={inputClass("baths")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> Area (sqft)
                  </label>
                  <input
                    type="text"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    placeholder="850"
                    className={inputClass("sqft")}
                  />
                </div>
              </div>
            </div>

            {/* 5. Featured Image & Gallery Uploads */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Featured Image & Gallery Upload
                </span>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Featured Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Upload New Image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleFeaturedChange}
                      className="hidden"
                    />
                  </label>

                  {/* Thumbnail preview */}
                  {(featuredPreview || currentFeaturedUrl) && (
                    <img
                      src={featuredPreview || currentFeaturedUrl}
                      alt="Featured"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Gallery Image Manager */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Gallery Uploads
                </label>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition mb-3">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Add Gallery Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleGalleryChange}
                    className="hidden"
                  />
                </label>

                {/* Grid Previews: Existing + Newly picked files */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {existingGallery.map((url, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-24"
                    >
                      <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {newGalleryPreviews.map((preview, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative group rounded-xl overflow-hidden border-2 border-indigo-400 bg-indigo-50 h-24"
                    >
                      <img src={preview} alt={`New upload ${idx}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Amenities */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Amenities
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DEFAULT_AMENITIES.map((item) => {
                  const isChecked = formData.amenities.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleAmenity(item)}
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
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomAmenity();
                    }
                  }}
                  placeholder="Custom amenity (e.g. EV Charger)..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.amenities.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className="hover:text-red-500 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Overview of amenities, rules, or features..."
                className={`${inputClass("description")} resize-none`}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                to={`/admin/properties/view/${id}`}
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
                <span>Save Property</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}