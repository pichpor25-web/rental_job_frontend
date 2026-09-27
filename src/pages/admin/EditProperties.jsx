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
  Upload,
  CheckSquare,
  Plus,
  Trash2,
  X,
  Layers,
} from "lucide-react";
import { fetchProperty, updateProperty } from "../../Api/propertyApi";
import { fetchUsers } from "../../Api/userApi";

const FALLBACK_OWNERS = [
  { id: 1, name: "Owner One" },
  { id: 2, name: "Owner Two" },
];

const PRESET_TAG_COLORS = [
  { label: "Indigo", value: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  {
    label: "Emerald",
    value: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  { label: "Amber", value: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Rose", value: "bg-rose-50 text-rose-700 border-rose-200" },
  { label: "Sky", value: "bg-sky-50 text-sky-700 border-sky-200" },
  { label: "Violet", value: "bg-violet-50 text-violet-700 border-violet-200" },
];

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

function responseData(response) {
  return response?.data?.data || response?.data || response;
}

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    owner_id: "",
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
    featured_image: "",
    gallery: [],
    amenities: [],
    description: "",
  });

  const [featuredFile, setFeaturedFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [owners, setOwners] = useState(FALLBACK_OWNERS);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setFetchError("");

        const [propertyRes, usersRes] = await Promise.all([
          fetchProperty(id),
          fetchUsers().catch(() => null),
        ]);

        const prop = responseData(propertyRes);
        if (!prop) {
          throw new Error("Property record could not be loaded.");
        }

        // Process Owners list
        const rawUsers = responseData(usersRes);
        const mappedOwners = (Array.isArray(rawUsers) ? rawUsers : [])
          .filter((user) => user && (user.id || user.user_id))
          .map((user) => ({
            id: Number(user.id ?? user.user_id),
            name:
              user.name ||
              user.full_name ||
              user.email ||
              `Owner ${user.id ?? user.user_id}`,
          }))
          .filter((user) => Number.isFinite(user.id));

        if (isMounted) {
          setOwners(mappedOwners.length ? mappedOwners : FALLBACK_OWNERS);

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

          const propTitle = prop.title || prop.name || "";
          const propAddress = prop.address || prop.location || "";

          setFormData({
            owner_id: prop.owner_id ?? prop.owner?.id ?? "",
            title: propTitle,
            name: prop.name || propTitle,
            tag: prop.tag || "",
            tag_color:
              prop.tag_color ||
              "bg-indigo-50 text-indigo-700 border-indigo-200",
            location: prop.location || propAddress,
            address: propAddress,
            price:
              prop.price !== null && prop.price !== undefined
                ? String(prop.price)
                : "",
            price_display: prop.price_display || "",
            price_suffix: prop.price_suffix || "/ mo",
            beds:
              prop.beds !== null && prop.beds !== undefined
                ? String(prop.beds)
                : "",
            baths:
              prop.baths !== null && prop.baths !== undefined
                ? String(prop.baths)
                : "",
            sqft:
              prop.sqft !== null && prop.sqft !== undefined
                ? String(prop.sqft)
                : "",
            featured_image: prop.featured_image || "",
            gallery: parseArray(prop.gallery)
              .map((item) => (typeof item === "object" ? item.url : item))
              .filter(Boolean),
            amenities: parseArray(prop.amenities),
            description: prop.description || "",
          });
        }
      } catch (err) {
        console.error("Failed to load property data:", err);
        if (isMounted) {
          setFetchError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load property details.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingOwners(false);
        }
      }
    };

    if (id) {
      loadInitialData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Sync title/name and address/location to match Laravel model booted hooks
      if (name === "title") updated.name = value;
      if (name === "name") updated.title = value;
      if (name === "address") updated.location = value;
      if (name === "location") updated.address = value;
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Gallery handlers
  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleGalleryFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setGalleryFiles((previous) => [...previous, ...files]);
    setGalleryPreviews((previous) => [
      ...previous,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    event.target.value = "";
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
    if (!String(formData.title).trim())
      newErrors.title = "Property Title / Name is required";
    if (!String(formData.address).trim())
      newErrors.address = "Address / Location is required";
    if (!formData.owner_id)
      newErrors.owner_id = "Please select a property owner";
    if (formData.price && isNaN(Number(formData.price)))
      newErrors.price = "Price must be a valid number";
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
        owner_id: Number(formData.owner_id),
        title: formData.title.trim(),
        name: formData.name.trim() || formData.title.trim(),
        tag: formData.tag.trim() || null,
        tag_color: formData.tag_color.trim() || null,
        location: formData.location.trim() || formData.address.trim(),
        address: formData.address.trim(),
        price: formData.price !== "" ? parseFloat(formData.price) : null,
        price_display: formData.price_display.trim() || null,
        price_suffix: formData.price_suffix.trim() || null,
        beds: formData.beds !== "" ? parseInt(formData.beds, 10) : null,
        baths: formData.baths !== "" ? parseInt(formData.baths, 10) : null,
        sqft: formData.sqft !== "" ? parseInt(formData.sqft, 10) : null,
        featured_image: formData.featured_image || null,
        gallery: formData.gallery,
        amenities: formData.amenities,
        description: formData.description.trim() || null,
      };

      if (featuredFile || galleryFiles.length > 0) {
        const data = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (["featured_image", "gallery"].includes(key)) return;
          if (value !== null && value !== undefined) {
            data.append(
              key,
              Array.isArray(value) ? JSON.stringify(value) : value,
            );
          }
        });
        if (featuredFile) data.append("featured_image", featuredFile);
        galleryFiles.forEach((file) => data.append("gallery[]", file));
        await updateProperty(id, data);
      } else {
        await updateProperty(id, payload);
      }
      navigate(`/admin/properties/view/${id}`);
    } catch (error) {
      console.error("Failed to update property:", error);
      alert(
        error?.response?.data?.message || "Failed to save property changes.",
      );
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
          <p className="text-sm font-medium">Loading property data...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Unable to Edit Property
          </h2>
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
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Property #{id}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Update listing information, pricing, specifications, media, and
              features.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Info & Owner */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Basic Info & Ownership
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Title / Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Modern Sunset Villa"
                    className={inputClass("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Owner <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="owner_id"
                      value={formData.owner_id}
                      onChange={handleInputChange}
                      disabled={loadingOwners}
                      className={`${inputClass("owner_id")} appearance-none`}
                    >
                      <option value="">Select an owner</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                    <Users className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.owner_id && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.owner_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Tag & Tag Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Badge / Tag
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="tag"
                      value={formData.tag}
                      onChange={handleInputChange}
                      placeholder="e.g. Featured, For Sale, Verified"
                      className={inputClass("tag")}
                    />
                    <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tag Style Preset
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

            {/* 2. Address & Location */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location & Address
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Address / Street <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address, city, state, zip"
                  className={inputClass("address")}
                />
                {errors.address && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pricing Details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Numeric Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1500.00"
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
                    Price Suffix
                  </label>
                  <input
                    type="text"
                    name="price_suffix"
                    value={formData.price_suffix}
                    onChange={handleInputChange}
                    placeholder="/ mo, / night"
                    className={inputClass("price_suffix")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Price Display Override
                  </label>
                  <input
                    type="text"
                    name="price_display"
                    value={formData.price_display}
                    onChange={handleInputChange}
                    placeholder="e.g. $1,500 / month"
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
                    placeholder="3"
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
                    placeholder="2"
                    className={inputClass("baths")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> Sqft
                  </label>
                  <input
                    type="number"
                    name="sqft"
                    min="0"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    placeholder="1200"
                    className={inputClass("sqft")}
                  />
                </div>
              </div>
            </div>

            {/* 5. Featured Image & Gallery */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Media & Gallery
                </span>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Featured Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                    <Upload className="w-4 h-4 text-indigo-600" /> Upload image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          setFeaturedFile(file);
                          setFeaturedPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  {(featuredPreview || formData.featured_image) && (
                    <img
                      src={featuredPreview || formData.featured_image}
                      alt="Featured Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                </div>
              </div>

              {/* Gallery Image Manager */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Gallery Images
                </label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <Upload className="w-4 h-4 text-indigo-600" /> Upload gallery
                  photos
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleGalleryFiles}
                  />
                </label>

                {/* Preview Gallery Grid */}
                {(formData.gallery.length > 0 ||
                  galleryPreviews.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {formData.gallery.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-24"
                      >
                        <img
                          src={url}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {galleryPreviews.map((preview, idx) => (
                      <div
                        key={`upload-${idx}`}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-24"
                      >
                        <img
                          src={preview}
                          alt={`Gallery upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryFiles((files) =>
                              files.filter((_, i) => i !== idx),
                            );
                            setGalleryPreviews((items) =>
                              items.filter((_, i) => i !== idx),
                            );
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

              {/* Add Custom Amenity Tag */}
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

              {/* Selected Amenities List */}
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
                placeholder="Comprehensive summary of features, terms, and neighborhood details..."
                className={`${inputClass("description")} resize-none`}
              />
            </div>

            {/* Actions */}
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
