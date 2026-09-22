import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  FileText,
  Compass,
  ArrowLeft,
  Loader2,
  Users,
  ShieldAlert,
} from "lucide-react";
import { fetchProperty, updateProperty } from "../../Api/propertyApi";
import { fetchUsers } from "../../Api/userApi";

const FALLBACK_OWNERS = [
  { id: 1, name: "Owner One" },
  { id: 2, name: "Owner Two" },
  { id: 3, name: "Owner Three" },
];

function responseData(response) {
  return response?.data?.data || response?.data || response;
}

function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    owner_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
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

        const propData = responseData(propertyRes);

        if (!propData) {
          throw new Error("Property details could not be found.");
        }

        // Process owners list
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
          const ownerList = [
            ...(mappedOwners.length ? mappedOwners : FALLBACK_OWNERS),
          ];
          const currentOwnerId = Number(propData.owner_id ?? propData.owner?.id);

          // Keep the property's current owner selectable even if the users API omits it
          if (
            currentOwnerId > 0 &&
            !ownerList.some((owner) => owner.id === currentOwnerId)
          ) {
            ownerList.unshift({
              id: currentOwnerId,
              name:
                propData.owner?.name ||
                propData.owner?.email ||
                `Owner ${currentOwnerId}`,
            });
          }

          setOwners(ownerList);

          setFormData({
            name: propData.name || "",
            description: propData.description || "",
            address: propData.address || "",
            latitude: propData.latitude ?? "",
            longitude: propData.longitude ?? "",
            owner_id: propData.owner_id ?? propData.owner?.id ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load property data:", err);
        if (isMounted) {
          setFetchError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load property details."
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGeoLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setGeoLocating(false);
        alert(
          err.code === 1
            ? "Location access was denied. You can still enter coordinates manually."
            : "Unable to detect your current location. You can enter coordinates manually."
        );
      }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!String(formData.name).trim())
      newErrors.name = "Property name is required";
    if (!String(formData.address).trim())
      newErrors.address = "Address is required";
    if (!formData.owner_id) newErrors.owner_id = "Please select an owner";
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
        name: String(formData.name).trim(),
        description: String(formData.description).trim(),
        address: String(formData.address).trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        owner_id: Number(formData.owner_id),
      };

      await updateProperty(id, payload);
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
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          to={`/admin/properties/view/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Property</span>
        </Link>

        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Property #{id}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Update property details, location coordinates, and owner info.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  General Information
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Grand Horizon Heights"
                  className={inputClass("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.name}
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
                    <option value="">Select owner</option>
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

            {/* Location & Geolocation */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location & Geolocation
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={geoLocating}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition"
                >
                  {geoLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Compass className="w-3.5 h-3.5" />
                  )}
                  <span>Detect GPS Location</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full street address"
                  className={inputClass("address")}
                />
                {errors.address && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.address}
                  </p>
                )}
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
                    placeholder="37.7749"
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
                    placeholder="-122.4194"
                    className={inputClass("longitude")}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
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

            {/* Action Buttons */}
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
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPropertyPage;