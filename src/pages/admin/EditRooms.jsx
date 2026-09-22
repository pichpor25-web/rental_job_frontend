import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  BedSingle,
  Building2,
  FileText,
  DollarSign,
  ArrowLeft,
  Loader2,
  Tag,
} from "lucide-react";
import { fetchRoomById, updateRoom } from "../../Api/roomApi";
import { fetchProperties } from "../../Api/propertyApi";

const EMPTY_FORM = {
  property_id: "",
  room_number: "",
  room_type: "",
  price: "",
  deposit: "",
  status: "available",
  description: "",
};

function EditRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoadingRoom(true);
        setLoadingProperties(true);

        const [roomResponse, propertiesResponse] = await Promise.all([
          fetchRoomById(id),
          fetchProperties(),
        ]);

        // 1. Process Properties List
        const rawProperties = Array.isArray(propertiesResponse?.data?.data)
          ? propertiesResponse.data.data
          : Array.isArray(propertiesResponse?.data)
            ? propertiesResponse.data
            : [];

        const mappedProperties = rawProperties
          .filter((prop) => prop && prop.id)
          .map((prop) => ({
            id: Number(prop.id),
            name: prop.name || `Property ${prop.id}`,
          }));

        // 2. Process Existing Room Data
        const roomData =
          roomResponse?.data?.data || roomResponse?.data || roomResponse;

        if (isMounted) {
          setProperties(mappedProperties);

          if (roomData) {
            setFormData({
              property_id: roomData.property_id
                ? String(roomData.property_id)
                : "",
              room_number: roomData.room_number || "",
              room_type: roomData.room_type || "",
              price: roomData.price ?? "",
              deposit: roomData.deposit ?? "",
              status: roomData.status || "available",
              description: roomData.description || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load room details:", error);
        alert("Failed to fetch room details. Returning to room management.");
        navigate("/admin/rooms");
      } finally {
        if (isMounted) {
          setLoadingRoom(false);
          setLoadingProperties(false);
        }
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.property_id)
      newErrors.property_id = "Please select a property";
    if (!formData.room_number.trim())
      newErrors.room_number = "Room number is required";
    if (!formData.room_type.trim())
      newErrors.room_type = "Room type is required";
    if (formData.price === "" || parseFloat(formData.price) < 0)
      newErrors.price = "Valid price is required";
    if (!formData.status) newErrors.status = "Please select status";
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
      // Every editable field is sent so that clearing a value (e.g. the deposit)
      // is persisted instead of silently keeping the previous one.
      const payload = {
        property_id: Number(formData.property_id),
        room_number: formData.room_number.trim(),
        room_type: formData.room_type.trim(),
        price: parseFloat(formData.price),
        deposit: formData.deposit === "" ? 0 : parseFloat(formData.deposit),
        status: formData.status,
        description: formData.description.trim(),
      };

      await updateRoom(id, payload);
      navigate("/admin/rooms");
    } catch (error) {
      console.error("Failed to update room:", error);
      const responseData = error?.response?.data;
      const fieldErrors = responseData?.errors;

      if (fieldErrors) {
        setErrors(
          Object.fromEntries(
            Object.entries(fieldErrors).map(([field, messages]) => [
              field,
              Array.isArray(messages) ? messages[0] : String(messages),
            ]),
          ),
        );
      }

      alert(
        (fieldErrors && Object.values(fieldErrors).flat()[0]) ||
          responseData?.message ||
          "Failed to update room",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium transition focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
      errors[fieldName] ? "border-red-300" : "border-slate-200"
    }`;

  if (loadingRoom) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span>Loading room details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          to="/admin/rooms"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rooms</span>
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <BedSingle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Room {formData.room_number && `#${formData.room_number}`}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Update unit parameters, property assignments, and rental pricing.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Property Assignment
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Property <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="property_id"
                    value={formData.property_id}
                    onChange={handleInputChange}
                    disabled={loadingProperties}
                    className={`${inputClass("property_id")} appearance-none`}
                  >
                    <option value="">Select Property</option>
                    {properties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.name}
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.property_id && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    {errors.property_id}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Room Details & Type
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleInputChange}
                    placeholder="e.g. 101, A-102"
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
                    Room Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="room_type"
                    value={formData.room_type}
                    onChange={handleInputChange}
                    placeholder="e.g. Studio, Deluxe"
                    className={inputClass("room_type")}
                  />
                  {errors.room_type && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      {errors.room_type}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pricing & Status
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Price <span className="text-red-500">*</span>
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
                    Deposit
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
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`${inputClass("status")} appearance-none`}
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="rented">Rented</option>
                    </select>
                    <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Overview of room amenities..."
                className={`${inputClass("description")} resize-none`}
              />
            </div>

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
                <span>Update Room</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditRoomPage;
