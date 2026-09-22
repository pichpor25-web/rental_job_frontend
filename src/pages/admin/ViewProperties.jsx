import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  FileText,
  Compass,
  ArrowLeft,
  Loader2,
  Users,
  Edit,
  ShieldAlert,
  Calendar,
  Clock,
  ExternalLink,
  Globe,
} from "lucide-react";
import { fetchPropertyById } from "../../Api/propertyApi";
import { fetchUsers } from "../../Api/userApi";

function ViewPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadPropertyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch property details and users/owners list concurrently
        const [propertyRes, usersRes] = await Promise.all([
          fetchPropertyById(id),
          fetchUsers().catch(() => null),
        ]);

        const propData = propertyRes?.data?.data || propertyRes?.data || propertyRes;

        if (!propData) {
          throw new Error("Property details could not be found.");
        }

        // Match Owner Information
        const rawUsers = Array.isArray(usersRes?.data?.data)
          ? usersRes.data.data
          : Array.isArray(usersRes?.data)
            ? usersRes.data
            : [];

        const matchedOwner = rawUsers.find(
          (u) => String(u.id ?? u.user_id) === String(propData.owner_id || propData.owner?.id)
        );

        if (isMounted) {
          setProperty(propData);
          setOwner(matchedOwner || propData.owner || null);
        }
      } catch (err) {
        console.error("Failed to fetch property details:", err);
        if (isMounted) {
          setError(err?.response?.data?.message || err.message || "Failed to load property details.");
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
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading property details...</p>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-xs rounded-xl hover:bg-indigo-700 transition"
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
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header Actions */}
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Property</span>
          </Link>
        </div>

        {/* Property Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {property.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                  ID: #{property.id}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Owned by: <strong className="text-slate-700 font-semibold">{ownerName}</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Information & Description Side */}
          <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  General Specifications
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Property Name
                  </span>
                  <span className="text-base font-bold text-slate-800">
                    {property.name || "N/A"}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Property Owner
                  </span>
                  <span className="text-base font-bold text-slate-800">
                    {ownerName}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Description
              </span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[100px] text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {property.description
                  ? property.description
                  : "No additional description provided for this property."}
              </div>
            </div>
          </div>

          {/* Location & GPS Information Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location & Coordinates
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Address
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {property.address || "No address specified"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Latitude
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {property.latitude ?? "N/A"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Longitude
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {property.longitude ?? "N/A"}
                    </span>
                  </div>
                </div>

                {hasCoordinates && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition"
                  >
                    <Globe className="w-4 h-4" />
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Created At:
                </span>
                <span className="font-semibold text-slate-700">
                  {property.created_at
                    ? new Date(property.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Last Updated:
                </span>
                <span className="font-semibold text-slate-700">
                  {property.updated_at
                    ? new Date(property.updated_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewPropertyPage;