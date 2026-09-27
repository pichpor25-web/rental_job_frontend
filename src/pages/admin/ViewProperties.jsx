import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  FileText,
  ArrowLeft,
  Loader2,
  Users,
  Edit,
  ShieldAlert,
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  Tag,
  Image as ImageIcon,
  CheckSquare,
  Layers,
} from "lucide-react";
import { fetchPropertyById } from "../../Api/propertyApi";
import { fetchUsers } from "../../Api/userApi";
import { resolveImageUrl } from "../../utils/imageHelper";

function responseData(response) {
  return response?.data?.data || response?.data || response;
}

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

export default function ViewPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredImageFailed, setFeaturedImageFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPropertyData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [propertyRes, usersRes] = await Promise.all([
          fetchPropertyById(id),
          fetchUsers().catch(() => null),
        ]);

        const propData = responseData(propertyRes);

        if (!propData) {
          throw new Error("Property record could not be loaded.");
        }

        const rawUsers = responseData(usersRes);
        const userList = Array.isArray(rawUsers) ? rawUsers : [];
        const matchedOwner = userList.find(
          (u) =>
            String(u.id ?? u.user_id) ===
            String(propData.owner_id || propData.owner?.id),
        );

        if (isMounted) {
          setProperty({
            ...propData,
            gallery: parseArray(propData.gallery),
            amenities: parseArray(propData.amenities),
          });
          setOwner(matchedOwner || propData.owner || null);
        }
      } catch (err) {
        console.error("Failed to fetch property details:", err);
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load property details.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadPropertyData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm">Loading property overview...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Unable to Load Property
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Link>
        </div>
      </div>
    );
  }

  const ownerName =
    owner?.name ||
    owner?.full_name ||
    property.owner_name ||
    property.owner?.name ||
    `Owner #${property.owner_id || "N/A"}`;

  const hasCoordinates = property.latitude && property.longitude;
  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${property.latitude},${property.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        property.address || property.location || "",
      )}`;

  const displayPrice =
    property.price_display ||
    (property.price !== null && property.price !== undefined
      ? `$${Number(property.price).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`
      : "Contact for pricing");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Link>

          <Link
            to={`/admin/properties/edit/${property.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Property</span>
          </Link>
        </div>

        {/* Hero Banner Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {property.featured_image && !featuredImageFailed ? (
              <img
                src={resolveImageUrl(property.featured_image)}
                alt={property.title || property.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                onError={() => setFeaturedImageFailed(true)}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {property.title || property.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                  #{property.id}
                </span>
                {property.tag && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      property.tag_color ||
                      "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    {property.tag}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Owned by{" "}
                    <strong className="text-slate-800 font-semibold">
                      {ownerName}
                    </strong>
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {property.address || property.location || "No Address"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Pricing Highlight */}
          <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shrink-0 text-left md:text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Rate
            </span>
            <div className="text-xl font-bold text-indigo-600 font-mono flex items-baseline gap-1">
              <span>{displayPrice}</span>
              {property.price_suffix && (
                <span className="text-xs font-normal text-slate-500">
                  {property.price_suffix}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Key Specs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Bedrooms
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {property.beds !== null && property.beds !== undefined
                  ? `${property.beds} Beds`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Bath className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Bathrooms
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {property.baths !== null && property.baths !== undefined
                  ? `${property.baths} Baths`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Area
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {property.sqft
                  ? `${Number(property.sqft).toLocaleString()} sqft`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monthly Price
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5 font-mono">
                {property.price !== null && property.price !== undefined
                  ? `$${Number(property.price).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery Section */}
            {property.gallery && property.gallery.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Image Gallery ({property.gallery.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-32"
                    >
                      <img
                        src={resolveImageUrl(imgUrl)}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        onError={(event) => { event.currentTarget.style.display = "none"; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description & Overview
                </span>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {property.description ||
                  "No detailed description provided for this listing."}
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Amenities & Facilities
                </span>
              </div>

              {property.amenities && property.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No specific amenities tagged for this property.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar / Meta Details */}
          <div className="space-y-6">
            {/* Location & Map */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location Information
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Full Address
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {property.address || property.location || "Not specified"}
                </p>
              </div>

              {hasCoordinates && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Latitude
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {property.latitude}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Longitude
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {property.longitude}
                    </span>
                  </div>
                </div>
              )}

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition"
              >
                <Globe className="w-4 h-4" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>

            {/* Metadata Timestamps */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-100">
                System Records
              </span>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Created:
                </span>
                <span className="font-semibold text-slate-700">
                  {property.created_at
                    ? new Date(property.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Last Updated:
                </span>
                <span className="font-semibold text-slate-700">
                  {property.updated_at
                    ? new Date(property.updated_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
