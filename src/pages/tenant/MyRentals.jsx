import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRentals } from "../../Api/rentalApi";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import RentalModal from "../../components/common/RentalModal";

export default function MyRentals({ modalMode = false, onClose = () => {} }) {
  const { isAuthenticated } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setLoading(false);
      return () => { active = false; };
    }
    fetchRentals()
      .then(({ data }) => {
        if (active) setRentals(Array.isArray(data) ? data : data?.data ?? []);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Could not load your rentals.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const content = (
      <main className={modalMode ? "" : "w-full max-w-5xl mx-auto px-4 py-10 flex-1"}>
        {!modalMode && <><h1 className="text-3xl font-bold text-slate-900">My Rentals</h1><p className="mt-2 text-slate-600">View your bookings and rental status.</p></>}
        {!isAuthenticated ? (
          <p className="mt-8 rounded-xl bg-white p-6">Please <Link className="text-indigo-600 underline" to="/login">sign in</Link> to view your rentals.</p>
        ) : loading ? <p className="mt-8">Loading rentals...</p>
          : error ? <p role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
            : rentals.length === 0 ? <p className="mt-8 rounded-xl bg-white p-6 text-slate-600">You do not have any rentals yet.</p>
              : <div className="mt-6 grid gap-4">{rentals.map((rental) => (
                <article key={rental.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="font-semibold text-slate-900">{rental.property_name || "Rental"} - {rental.room_name || rental.room_number || `Room ${rental.room_id}`}</h2>
                      <p className="mt-1 text-sm text-slate-600">Booking {rental.booking_code || `#${rental.id}`}</p></div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium capitalize text-indigo-700">{String(rental.status || "unknown").replaceAll("_", " ")}</span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div><dt className="text-slate-500">Dates</dt><dd className="font-medium">{rental.start_date || "-"} to {rental.end_date || "Ongoing"}</dd></div>
                    <div><dt className="text-slate-500">Guests</dt><dd className="font-medium">{rental.total_guests ?? 1}</dd></div>
                    <div><dt className="text-slate-500">Monthly rent</dt><dd className="font-medium">${Number(rental.monthly_rent || 0).toFixed(2)}</dd></div>
                    <div><dt className="text-slate-500">Nightly rate</dt><dd className="font-medium">${Number(rental.nightly_rate || 0).toFixed(2)}</dd></div>
                    <div><dt className="text-slate-500">Service fee</dt><dd className="font-medium">${Number(rental.service_fee || 0).toFixed(2)}</dd></div>
                    <div><dt className="text-slate-500">Cleaning fee</dt><dd className="font-medium">${Number(rental.cleaning_fee || 0).toFixed(2)}</dd></div>
                    <div><dt className="text-slate-500">Deposit</dt><dd className="font-medium">${Number(rental.deposit || 0).toFixed(2)}</dd></div>
                    <div><dt className="text-slate-500">Total amount</dt><dd className="font-medium">${Number(rental.total_amount || 0).toFixed(2)}</dd></div>
                  </dl>
                  {rental.special_requests && <p className="mt-4 text-sm text-slate-600"><span className="font-medium text-slate-700">Special requests:</span> {rental.special_requests}</p>}
                </article>
              ))}</div>}
        <Link className="mt-6 inline-block text-indigo-600 underline" to="/my-rental-requests">View my rental requests</Link>
      </main>
  );

  if (modalMode) return <RentalModal title="My Rentals" subtitle="View your bookings and rental status." onClose={onClose}>{content}</RentalModal>;
  return <div className="min-h-screen bg-slate-50 flex flex-col"><Navbar />{content}<Footer /></div>;
}
