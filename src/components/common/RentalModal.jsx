import { CalendarDays, X } from "lucide-react";

export default function RentalModal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <header className="flex items-center gap-3 bg-[#0b1f3a] px-6 py-5 text-white">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dcae4d] text-[#0b1f3a]"><CalendarDays className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-slate-300">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        </header>
        <div className="overflow-y-auto p-5 sm:p-7">{children}</div>
        <footer className="flex justify-end border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
        </footer>
      </section>
    </div>
  );
}
