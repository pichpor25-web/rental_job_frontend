import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRentals } from "../../Api/rentalApi";
import { fetchRentalRequests } from "../../Api/rentalRequestApi";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import KHQRPaymentModal from "../../components/payment/KHQRPaymentModal";
import RentalModal from "../../components/common/RentalModal";

export default function RentalRequests({ modalMode = false, onClose = () => {} }) {
  const { isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [rentalsByRequest, setRentalsByRequest] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payRental, setPayRental] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    const [requestResponse, rentalResponse] = await Promise.all([
      fetchRentalRequests(),
      fetchRentals(),
    ]);
    const requestRows = Array.isArray(requestResponse.data) ? requestResponse.data : requestResponse.data?.data ?? [];
    const rentalRows = Array.isArray(rentalResponse.data) ? rentalResponse.data : rentalResponse.data?.data ?? [];
    setRequests(requestRows);
    setRentalsByRequest(Object.fromEntries(rentalRows.filter((rental) => rental.rental_request_id).map((rental) => [rental.rental_request_id, rental])));
  }, []);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setLoading(false);
      return () => { active = false; };
    }
    Promise.all([fetchRentalRequests(), fetchRentals()])
      .then(([requestResponse, rentalResponse]) => {
        if (!active) return;
        const requestRows = Array.isArray(requestResponse.data) ? requestResponse.data : requestResponse.data?.data ?? [];
        const rentalRows = Array.isArray(rentalResponse.data) ? rentalResponse.data : rentalResponse.data?.data ?? [];
        setRequests(requestRows);
        setRentalsByRequest(Object.fromEntries(rentalRows.filter((rental) => rental.rental_request_id).map((rental) => [rental.rental_request_id, rental])));
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Could not load your rental requests.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Could not refresh your rental requests.");
    } finally {
      setRefreshing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setPayRental(null);
    await handleRefresh();
  };

  const content = (
      <main className={modalMode ? "" : "w-full max-w-5xl mx-auto px-4 py-10 flex-1"}>
        {!modalMode && <h1 className="text-3xl font-bold text-slate-900">My Rental Requests</h1>}
        <div className={`${modalMode ? "" : "mt-2"} flex flex-wrap items-center justify-between gap-3`}><p className="text-slate-600">Payment becomes available after the owner or admin approves your request.</p>{isAuthenticated && <button type="button" onClick={handleRefresh} disabled={refreshing} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50">{refreshing ? "Refreshing..." : "Refresh status"}</button>}</div>
        {!isAuthenticated ? (
          <p className="mt-8 rounded-xl bg-white p-6">Please <Link className="text-indigo-600 underline" to="/login">sign in</Link> to view your requests.</p>
        ) : loading ? <p className="mt-8">Loading requests...</p>
          : error ? <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
            : requests.length === 0 ? <p className="mt-8 rounded-xl bg-white p-6 text-slate-600">You have not submitted any rental requests.</p>
              : <div className="mt-6 grid gap-4">{requests.map((request) => {
                const rental = rentalsByRequest[request.id];
                const isApproved = ["approved", "converted"].includes(String(request.status).toLowerCase());
                const isPaid = ["confirmed", "active", "completed"].includes(String(rental?.status || "").toLowerCase());
                return <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="font-semibold text-slate-900">{request.property_name || "Property"} - {request.room_name || request.room_number || `Room ${request.room_id}`}</h2><p className="mt-1 text-sm text-slate-600">Request #{request.id}</p></div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium capitalize text-indigo-700">{String(request.status || "unknown").replaceAll("_", " ")}</span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div><dt className="text-slate-500">Requested dates</dt><dd className="font-medium">{request.start_date || "-"} to {request.end_date || "Ongoing"}</dd></div>
                    <div><dt className="text-slate-500">Guests</dt><dd className="font-medium">{request.total_guests ?? 1}</dd></div>
                    <div><dt className="text-slate-500">Estimated total</dt><dd className="font-medium">${Number(request.estimated_total || 0).toFixed(2)}</dd></div>
                  </dl>
                  {request.message && <p className="mt-3 text-sm text-slate-600">{request.message}</p>}
                  {isApproved && rental && !isPaid ? (
                    <button type="button" onClick={() => setPayRental(rental)} className="mt-4 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Pay with Bakong KHQR</button>
                  ) : isApproved && isPaid ? <p className="mt-4 text-sm text-emerald-700">Payment received. Your rental is {String(rental.status).replaceAll("_", " ")}.</p>
                    : isApproved ? <p className="mt-4 text-sm text-amber-700">Approved. Payment details are loading...</p>
                    : request.status === "rejected" ? <p className="mt-4 text-sm text-rose-700">This request was declined.</p>
                      : <p className="mt-4 text-sm text-slate-500">Waiting for owner or admin approval.</p>}
                </article>;
              })}</div>}
        <Link className="mt-6 inline-block text-indigo-600 underline" to="/my-rentals">View my rentals</Link>
      </main>
  );
  const paymentModal = payRental && <KHQRPaymentModal isOpen={Boolean(payRental)} onClose={() => setPayRental(null)} rentalId={payRental.id} amount={Number(payRental.total_amount || 0) + Number(payRental.deposit || 0)} calculation={{ nights: Math.max(1, Math.ceil((new Date(payRental.end_date) - new Date(payRental.start_date)) / 86400000)), nightly_rate: Number(payRental.nightly_rate || 0), base_price: Number(payRental.nightly_rate || 0) * Math.max(1, Math.ceil((new Date(payRental.end_date) - new Date(payRental.start_date)) / 86400000)), service_fee: Number(payRental.service_fee || 0), cleaning_fee: Number(payRental.cleaning_fee || 0), deposit: Number(payRental.deposit || 0), total_amount: Number(payRental.total_amount || 0) + Number(payRental.deposit || 0) }} propertyName={payRental.property_name || "Room Rental"} roomName={payRental.room_name || "Room"} onPaymentSuccess={handlePaymentSuccess} />;

  if (modalMode) return <><RentalModal title="My Rental Requests" subtitle="Track your requests and payment status." onClose={onClose}>{content}</RentalModal>{paymentModal}</>;
  return <div className="min-h-screen bg-slate-50 flex flex-col"><Navbar />{content}<Footer />{paymentModal}</div>;
}
