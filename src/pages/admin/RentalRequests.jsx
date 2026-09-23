import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  TrendingUp,
  Check,
  Loader2,
  AlertTriangle,
  Building2,
  BedSingle,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Edit3,
} from "lucide-react";
import {
  fetchRentalRequests,
  updateRentalRequestStatus,
} from "../../Api/rentalRequestApi";

const REQUEST_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  {
    value: "approved",
    label: "Approved",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
];

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

function StatCard({ label, value, icon: Icon, tint, trend }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
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

function StatusBadge({ status }) {
  const matched = REQUEST_STATUSES.find((s) => s.value === status) || {
    label: status,
    color: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${matched.color}`}
    >
      {matched.label}
    </span>
  );
}

export default function RentalRequestManagement() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Status Update Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [requestToUpdate, setRequestToUpdate] = useState(null);
  const [newStatusSelection, setNewStatusSelection] = useState("");

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const [updating, setUpdating] = useState(false);

  const showToast = (type, message) => setToast({ type, message });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetchRentalRequests();
      const rawData = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
      setRequests(rawData);
    } catch (error) {
      console.error("Failed to fetch rental requests:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Couldn't load rental requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
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

  // Metrics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const approvedRequests = requests.filter(
    (r) => r.status === "approved",
  ).length;

  // Filter logic
  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter((r) => {
      const roomNum = String(r.room_number || "").toLowerCase();
      const propName = String(r.property_name || "").toLowerCase();
      const tenantName = String(r.tenant_name || "").toLowerCase();
      const tenantEmail = String(r.tenant_email || "").toLowerCase();

      const matchesSearch =
        !q ||
        roomNum.includes(q) ||
        propName.includes(q) ||
        tenantName.includes(q) ||
        tenantEmail.includes(q);

      const matchesStatus =
        selectedStatusFilter === "ALL" || r.status === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, selectedStatusFilter]);

  // Open Status Update Modal
  const openStatusModal = (req) => {
    setRequestToUpdate(req);
    // Pre-select current status if valid, otherwise default to "approved"
    setNewStatusSelection(
      req.status === "approved" || req.status === "rejected"
        ? req.status
        : "approved",
    );
    setStatusModalOpen(true);
    setActiveMenuId(null);
  };

  // Submit Status Change (Payload restricted to approved/rejected)
  const handleSubmitStatus = async (e) => {
    e.preventDefault();
    if (
      !requestToUpdate ||
      !["approved", "rejected"].includes(newStatusSelection)
    ) {
      showToast("error", "Status must be either approved or rejected.");
      return;
    }

    try {
      setUpdating(true);
      await updateRentalRequestStatus(requestToUpdate.id, newStatusSelection);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestToUpdate.id
            ? { ...r, status: newStatusSelection }
            : r,
        ),
      );

      if (selectedRequest?.id === requestToUpdate.id) {
        setSelectedRequest((prev) => ({
          ...prev,
          status: newStatusSelection,
        }));
      }

      showToast(
        "success",
        `Request #${requestToUpdate.id} marked as ${newStatusSelection}.`,
      );
      setStatusModalOpen(false);
      setRequestToUpdate(null);
    } catch (error) {
      console.error("Status update failed:", error);
      showToast("error", error?.response?.data?.message || "Action failed.");
    } finally {
      setUpdating(false);
    }
  };

  const openDetailsModal = (req) => {
    setSelectedRequest(req);
    setDetailsModalOpen(true);
    setActiveMenuId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Rental Requests
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and manage incoming application requests from prospective
              tenants.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <StatCard
            label="Total Applications"
            value={loading ? "—" : totalRequests}
            icon={FileText}
            tint="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Pending Review"
            value={loading ? "—" : pendingRequests}
            icon={Clock}
            tint="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Approved"
            value={loading ? "—" : approvedRequests}
            icon={CheckCircle}
            tint="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tenant, room #, property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">All Statuses</option>
              {REQUEST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatusFilter("ALL");
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Requests Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Room & Property</th>
                  <th className="py-3 px-4">Requested Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-5 w-8 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-32 bg-slate-100 rounded mb-1" />
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-36 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 w-20 bg-slate-100 rounded-full" />
                      </td>
                      <td className="py-4 px-4" />
                    </tr>
                  ))
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/60 transition duration-150"
                    >
                      <td className="py-4 px-4 font-medium text-slate-900">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          #{req.id}
                        </span>
                      </td>

                      {/* Applicant Info */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">
                          {req.tenant_name || `Tenant #${req.user_id}`}
                        </div>
                        {req.tenant_email && (
                          <div className="text-xs text-slate-400">
                            {req.tenant_email}
                          </div>
                        )}
                      </td>

                      {/* Room and Property */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <BedSingle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              Room {req.room_number || req.room_id}
                            </div>
                            <div className="text-xs text-slate-400">
                              {req.property_name || "Property Unit"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Requested Dates */}
                      <td className="py-4 px-4 text-xs font-mono text-slate-600">
                        <div>
                          Start:{" "}
                          <span className="font-semibold">
                            {req.start_date}
                          </span>
                        </div>
                        {req.end_date && (
                          <div className="text-slate-400">
                            End: {req.end_date}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 pr-6 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === req.id ? null : req.id,
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {activeMenuId === req.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="origin-top-right absolute right-6 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 py-1 z-20 text-left"
                          >
                            <button
                              onClick={() =>
                                navigate(`/admin/rentalrequest/${req.id}`)
                              }
                              className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>

                            <button
                              onClick={() => openStatusModal(req)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-indigo-600 hover:bg-indigo-50 w-full font-medium"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Update Status
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <FileText className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        No rental requests found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && (
            <div className="px-6 py-4 border-t border-slate-100 text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredRequests.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {totalRequests}
              </span>{" "}
              requests
            </div>
          )}
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {statusModalOpen && requestToUpdate && (
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

            <form onSubmit={handleSubmitStatus} className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Update status for Request{" "}
                <span className="font-semibold text-slate-800">
                  #{requestToUpdate.id}
                </span>{" "}
                (
                {requestToUpdate.tenant_name ||
                  `Tenant #${requestToUpdate.user_id}`}
                ).
              </p>

              <div className="space-y-3 mb-6">
                {/* Approved Option */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    newStatusSelection === "approved"
                      ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={newStatusSelection === "approved"}
                    onChange={(e) => setNewStatusSelection(e.target.value)}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Approved
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Accept this request and allow the tenant to proceed.
                    </p>
                  </div>
                </label>

                {/* Rejected Option */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    newStatusSelection === "rejected"
                      ? "border-rose-500 bg-rose-50/40 ring-1 ring-rose-500"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="rejected"
                    checked={newStatusSelection === "rejected"}
                    onChange={(e) => setNewStatusSelection(e.target.value)}
                    className="mt-1 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Rejected
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Decline this rental application.
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

      {/* VIEW DETAILS MODAL */}
      {detailsModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Application #{selectedRequest.id} Details
              </h3>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Current Status</span>
                <StatusBadge status={selectedRequest.status} />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Applicant</span>
                <span className="font-semibold text-slate-800">
                  {selectedRequest.tenant_name ||
                    `Tenant #${selectedRequest.user_id}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Property / Room</span>
                <span className="font-semibold text-slate-800">
                  {selectedRequest.property_name || "Unit"} - Room{" "}
                  {selectedRequest.room_number || selectedRequest.room_id}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Start Date</span>
                <span className="font-mono text-slate-800">
                  {selectedRequest.start_date}
                </span>
              </div>
              {selectedRequest.end_date && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">End Date</span>
                  <span className="font-mono text-slate-800">
                    {selectedRequest.end_date}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  openStatusModal(selectedRequest);
                }}
                className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                Change Status
              </button>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
