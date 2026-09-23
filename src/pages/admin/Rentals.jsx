import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  KeyRound,
  Building2,
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  X,
  TrendingUp,
  Check,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
// Replace or verify these import paths match your project structure
import {
  fetchRentals,
  updateRentalStatus,
  deleteRental,
} from "../../Api/rentalApi";

const RENTAL_STATUSES = [
  {
    value: "pending_payment",
    label: "Pending Payment",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  {
    value: "active",
    label: "Active",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Check,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
];

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const normalizeRental = (rental) => {
  const monthlyRent = toNumberOrNull(rental.monthly_rent) ?? 0;
  const deposit = toNumberOrNull(rental.deposit) ?? 0;

  // Calculate total paid across related payments
  const payments = Array.isArray(rental.payments) ? rental.payments : [];
  const totalPaid = payments.reduce(
    (sum, p) => sum + (toNumberOrNull(p.amount) ?? 0),
    0,
  );

  return {
    ...rental,
    tenant_name: rental.user?.name || rental.tenant_name || "Unknown Tenant",
    tenant_phone: rental.user?.phone || rental.tenant_phone || "—",
    room_number: rental.room?.room_number || rental.room_number || "—",
    property_name:
      rental.room?.property?.name ||
      rental.property_name ||
      "Unassigned Property",
    monthly_rent: monthlyRent,
    deposit,
    total_due: monthlyRent + deposit,
    total_paid: totalPaid,
    status: rental.status || "pending_payment",
    start_date: rental.start_date || null,
    end_date: rental.end_date || null,
    payments,
  };
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

function StatusBadge({ status }) {
  const matched = RENTAL_STATUSES.find((s) => s.value === status) || {
    label: status,
    color: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${matched.color}`}
    >
      {matched.label}
    </span>
  );
}

export default function RentalManagement() {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchRentals();

      // Normalize pagination data (Laravel paginator returns { data: [...], ... })
      const rawRentals = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
            ? res
            : [];

      setRentals(rawRentals.map(normalizeRental));
    } catch (error) {
      console.error("Failed to fetch rental management data:", error);
      setRentals([]);
      showToast("error", "Couldn't load rentals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Summary Metrics
  const totalRentals = rentals.length;
  const activeRentals = rentals.filter((r) => r.status === "active").length;
  const pendingRentals = rentals.filter(
    (r) => r.status === "pending_payment",
  ).length;
  const totalMonthlyRevenue = rentals
    .filter((r) => r.status === "active")
    .reduce((sum, r) => sum + r.monthly_rent, 0);

  const filteredRentals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rentals.filter((r) => {
      const tenant = (r.tenant_name || "").toLowerCase();
      const roomNum = (r.room_number || "").toLowerCase();
      const propName = (r.property_name || "").toLowerCase();

      const matchesSearch =
        !q || tenant.includes(q) || roomNum.includes(q) || propName.includes(q);

      const matchesStatus =
        selectedStatusFilter === "ALL" || r.status === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rentals, searchQuery, selectedStatusFilter]);

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      setUpdatingStatusId(rentalId);
      await updateRentalStatus(rentalId, { status: newStatus });
      setRentals((prev) =>
        prev.map((r) => (r.id === rentalId ? { ...r, status: newStatus } : r)),
      );
      showToast("success", `Rental #${rentalId} status set to "${newStatus}".`);
      setActiveMenuId(null);
    } catch (error) {
      console.error("Failed to update rental status:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to update status.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (rental) => {
    if (
      !confirm(
        `Are you sure you want to delete rental record #${rental.id} (${rental.tenant_name})?`,
      )
    )
      return;

    try {
      setDeletingId(rental.id);
      await deleteRental(rental.id);
      setRentals((prev) => prev.filter((r) => r.id !== rental.id));
      setActiveMenuId(null);
      showToast("success", `Rental #${rental.id} has been deleted.`);
    } catch (error) {
      console.error("Failed to delete rental:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to delete rental record.",
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
              Rental Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track leases, tenant agreements, payment completions, and active
              occupancy.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/rentals/new")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rental Agreement</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="Total Leases"
            value={loading ? "—" : totalRentals}
            icon={KeyRound}
            tint="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            label="Active Rentals"
            value={loading ? "—" : activeRentals}
            icon={Check}
            tint="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Pending Action"
            value={loading ? "—" : pendingRentals}
            icon={Clock}
            tint="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Active Monthly Inflow"
            value={loading ? "—" : `$${totalMonthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
            tint="bg-violet-50 text-violet-600"
            trend="Active monthly rents"
          />
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tenant, room #, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">All Statuses</option>
              {RENTAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <button className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Rentals Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Tenant</th>
                  <th className="py-3 px-4">Room & Property</th>
                  <th className="py-3 px-4">Lease Duration</th>
                  <th className="py-3 px-4">Monthly Rent</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4">Paid / Total Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-5 w-10 bg-slate-100 rounded-full" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-slate-100 rounded" />
                          <div className="h-3 w-20 bg-slate-100 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 bg-slate-100 rounded" />
                          <div className="h-3 w-40 bg-slate-100 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-24 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-16 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-16 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3.5 w-24 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 w-20 bg-slate-100 rounded-full" />
                      </td>
                      <td className="py-4 px-4" />
                    </tr>
                  ))
                ) : filteredRentals.length > 0 ? (
                  filteredRentals.map((rental) => (
                    <tr
                      key={rental.id}
                      className="hover:bg-slate-50/60 transition duration-150"
                    >
                      <td className="py-4 px-4 font-medium text-slate-900">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          #{rental.id}
                        </span>
                      </td>

                      {/* Tenant Information */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                            {rental.tenant_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {rental.tenant_name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {rental.tenant_phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Room & Property */}
                      <td className="py-4 px-4 font-medium text-slate-900">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900">
                            Room {rental.room_number}
                          </div>
                          <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span>{rental.property_name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Lease Dates */}
                      <td className="py-4 px-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{rental.start_date || "N/A"}</span>
                        </div>
                        <div className="text-slate-400 pl-4.5">
                          to {rental.end_date || "Ongoing"}
                        </div>
                      </td>

                      {/* Monthly Rent */}
                      <td className="py-4 px-4 font-semibold text-slate-900 font-mono">
                        ${rental.monthly_rent.toFixed(2)}
                      </td>

                      {/* Deposit */}
                      <td className="py-4 px-4 font-medium text-slate-600 font-mono">
                        ${rental.deposit.toFixed(2)}
                      </td>

                      {/* Payments comparison */}
                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-emerald-600">
                          ${rental.total_paid.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          / ${rental.total_due.toFixed(2)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={rental.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 pr-6 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === rental.id ? null : rental.id,
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        >
                          {deletingId === rental.id ||
                          updatingStatusId === rental.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <MoreHorizontal className="w-5 h-5" />
                          )}
                        </button>

                        {activeMenuId === rental.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="origin-top-right absolute right-6 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-100 py-1 z-20"
                          >
                            <button
                              onClick={() =>
                                navigate(`/admin/rentals/view/${rental.id}`)
                              }
                              className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/payments?rental_id=${rental.id}`,
                                )
                              }
                              className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 w-full text-left"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> View
                              Payments
                            </button>

                            <div className="my-1 border-t border-slate-100" />
                            <div className="px-4 py-1 text-[10px] font-semibold uppercase text-slate-400">
                              Update Status
                            </div>

                            {rental.status !== "active" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(rental.id, "active")
                                }
                                className="flex items-center gap-2 px-4 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 w-full text-left"
                              >
                                Mark as Active
                              </button>
                            )}

                            {rental.status !== "completed" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(rental.id, "completed")
                                }
                                className="flex items-center gap-2 px-4 py-1.5 text-xs text-blue-600 hover:bg-blue-50 w-full text-left"
                              >
                                Mark as Completed
                              </button>
                            )}

                            {rental.status !== "cancelled" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(rental.id, "cancelled")
                                }
                                className="flex items-center gap-2 px-4 py-1.5 text-xs text-amber-600 hover:bg-amber-50 w-full text-left"
                              >
                                Mark as Cancelled
                              </button>
                            )}

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              onClick={() => handleDelete(rental)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Record
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-16 text-center">
                      <KeyRound className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        {rentals.length === 0
                          ? "No rental records found."
                          : "No rentals match your filter criteria."}
                      </p>
                      {rentals.length === 0 ? (
                        <button
                          onClick={() => navigate("/admin/rentals/new")}
                          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="w-4 h-4" /> Create your first rental
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedStatusFilter("ALL");
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
                  {filteredRentals.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalRentals}
                </span>{" "}
                rentals
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
