import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BedSingle, Building2, CalendarDays, Clock3, Loader2, ShieldAlert, UserRound } from "lucide-react";
import { fetchRentalById } from "../../Api/rentalApi";
import { resolveImageUrl } from "../../utils/imageHelper";

function responseData(response) {
  return response?.data?.data || response?.data || response;
}

export default function ViewRentalPage() {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchRentalById(id)
      .then((response) => {
        const data = responseData(response);
        if (!data) throw new Error("Rental not found.");
        if (active) setRental(data);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || err.message || "Could not load rental details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500"><Loader2 className="w-7 h-7 animate-spin mr-2" />Loading rental…</div>;
  if (error || !rental) return <main className="min-h-screen bg-slate-50 p-8"><section className="max-w-xl mx-auto rounded-2xl bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto mb-3 h-10 w-10 text-rose-500" /><h1 className="text-xl font-bold">Unable to load rental</h1><p className="my-4 text-sm text-slate-500">{error || "Rental not found."}</p><Link to="/admin/rental" className="inline-flex items-center gap-2 text-indigo-600"><ArrowLeft className="h-4 w-4" />Back to rentals</Link></section></main>;

  const status = String(rental.status || "Unknown").replaceAll("_", " ");
  const image = resolveImageUrl(rental.room_image_url);
  const date = (value) => value ? new Date(value).toLocaleDateString() : "—";
  const amount = (value) => value == null ? "—" : `$${Number(value).toFixed(2)}`;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8 text-slate-800">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to="/admin/rental" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Back to rentals</Link>
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div><p className="text-sm text-slate-500">Booking {rental.booking_code || `#${rental.id}`}</p><h1 className="mt-1 text-2xl font-bold">Rental #{rental.id}</h1></div>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold capitalize text-indigo-700">{status}</span>
        </header>
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3">
            {image ? <img src={image} alt={rental.room_name || "Rental room"} className="h-72 w-full rounded-2xl object-cover" /> : <div className="flex h-56 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><BedSingle className="h-14 w-14" /></div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Info icon={Building2} label="Property" value={rental.property_name || rental.property_title || "—"} />
              <Info icon={BedSingle} label="Room" value={rental.room_name || rental.room_number || `Room #${rental.room_id}`} />
              <Info icon={UserRound} label="Tenant" value={rental.tenant_name || `User #${rental.user_id}`} />
              <Info icon={CalendarDays} label="Guests" value={rental.total_guests ?? "—"} />
            </div>
            <div className="rounded-2xl bg-slate-50 p-4"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Special requests</p><p className="whitespace-pre-line text-sm">{rental.special_requests || "None"}</p></div>
          </div>
          <aside className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold">Rental summary</h2>
            <Info icon={CalendarDays} label="Rental period" value={`${date(rental.start_date)} – ${date(rental.end_date)}`} />
            <Info icon={Clock3} label="Monthly rent" value={amount(rental.monthly_rent)} />
            <Info icon={Clock3} label="Nightly rate" value={amount(rental.nightly_rate)} />
            <Info icon={Clock3} label="Fees" value={amount(Number(rental.service_fee || 0) + Number(rental.cleaning_fee || 0))} />
            <div className="border-t border-slate-100 pt-4"><div className="flex justify-between text-sm"><span className="text-slate-500">Total amount</span><strong>{amount(rental.total_amount)}</strong></div><div className="mt-2 flex justify-between text-sm"><span className="text-slate-500">Deposit</span><strong>{amount(rental.deposit)}</strong></div></div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Info({ icon: Icon, label, value }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p></div></div>;
}