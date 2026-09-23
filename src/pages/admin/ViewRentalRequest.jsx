import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileText,
  Building2,
  BedSingle,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Edit3,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";
import {
  fetchRentalRequests,
  fetchRentalRequestById,
  updateRentalRequestStatus,
} from "../../Api/rentalRequestApi";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const config = STATUS_CONFIG[normalized] || {
    label: status || "Unknown",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="capitalize">{config.label}</span>
    </span>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed top-5 right-5 z-[70] flex items-start gap-3 max-w-sm w-full px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-2 duration-200 ${
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
      role="alert"
    >
      {isError ? (
        <AlertTriangle className="w-4 h-4.5 mt-0.5 shrink-0" />
      ) : (
        <Check className="w-4 h-4.5 mt-0.5 shrink-0" />
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

export default function ViewRentalRequestPage() {
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Modal & Form state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("approved");
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  useEffect(() => {
    let isMounted = true;

    const loadRequestData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch single request by id directly, fallback to list if needed
        let matched = null;
        try {
          const res = await fetchRentalRequestById(id);
          matched = res?.data?.data || res?.data || res;
        } catch {
          const res = await fetchRentalRequests();
          const dataList = Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res)
                ? res
                : [];
          matched = dataList.find((item) => String(item.id) === String(id));
        }

        if (!matched) {
          throw new Error("Rental request not found.");
        }

        if (isMounted) {
          setRequest(matched);
          setNewStatus(
            matched.status === "approved" || matched.status === "rejected"
              ? matched.status
              : "approved",
          );
        }
      } catch (err) {
        console.error("Failed to load rental request:", err);
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load rental request details.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadRequestData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Handle status update submitting required 'approved' | 'rejected'
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!["approved", "rejected"].includes(newStatus)) {
      showToast("error", "Status must be either approved or rejected.");
      return;
    }

    try {
      setUpdating(true);
      const res = await updateRentalRequestStatus(request.id, newStatus);
      const updatedData = res.data || res;

      setRequest((prev) => ({
        ...prev,
        ...updatedData,
        status: newStatus,
      }));

      showToast("success", `Request #${request.id} marked as ${newStatus}.`);
      setStatusModalOpen(false);
    } catch (err) {
      console.error("Status update error:", err);
      showToast(
        "error",
        err?.response?.data?.message || "Failed to update status.",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Unable to Load Request
          </h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            to="/admin/rentalrequest"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium text-xs rounded-xl hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Rental Requests</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/admin/rentalrequest"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Requests</span>
          </Link>

          <button
            onClick={() => setStatusModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Status</span>
          </button>
        </div>

        {/* Request Top Overview Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  Rental Request #{request.id}
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>
                  Applicant: {request.tenant_name || `User #${request.user_id}`}
                </span>
              </p>
            </div>
          </div>

          <div>
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details (Applicant & Property) */}
          <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            {/* Applicant Information */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Applicant Information
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Full Name
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {request.tenant_name || `User #${request.user_id}`}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Email
                  </span>
                  <span className="text-sm font-semibold text-slate-700 truncate block">
                    {request.tenant_email || "Not Provided"}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Phone
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {request.tenant_phone || "Not Provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Room & Property Info */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Room & Property
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/60 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Property
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {request.property_name || "Assigned Property"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/60 text-indigo-600 flex items-center justify-center shrink-0">
                    <BedSingle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Room Number
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      Room {request.room_number || request.room_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note or Message */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Applicant Note / Message
              </span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[90px] text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {request.message ||
                  request.note ||
                  "No additional comments provided by applicant."}
              </div>
            </div>
          </div>

          {/* Dates & Timeline Side Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rental Period
                </span>
              </div>

              <div className="space-y-3">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600/70 block mb-1">
                    Start Date
                  </span>
                  <div className="text-lg font-bold text-indigo-900 font-mono">
                    {request.start_date || "N/A"}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    End Date
                  </span>
                  <div className="text-lg font-bold text-slate-800 font-mono">
                    {request.end_date || "Open Ended / Not Specified"}
                  </div>
                </div>
              </div>
            </div>

            {/* System Metadata */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Submitted On:
                </span>
                <span className="font-semibold text-slate-700">
                  {request.created_at
                    ? new Date(request.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Last Updated:
                </span>
                <span className="font-semibold text-slate-700">
                  {request.updated_at
                    ? new Date(request.updated_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPDATE STATUS MODAL (Restricted to approved, rejected) */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">
                Update Request Status
              </h3>
              <button
                onClick={() => !updating && setStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Update status for Request{" "}
                <span className="font-semibold text-slate-800">
                  #{request.id}
                </span>
                .
              </p>

              <div className="space-y-3 mb-6">
                {/* Approved Radio */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    newStatus === "approved"
                      ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={newStatus === "approved"}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Approved
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Accept this application and grant tenant reservation.
                    </p>
                  </div>
                </label>

                {/* Rejected Radio */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    newStatus === "rejected"
                      ? "border-rose-500 bg-rose-50/40 ring-1 ring-rose-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="rejected"
                    checked={newStatus === "rejected"}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Rejected
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Decline this application request.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition shadow-sm"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
