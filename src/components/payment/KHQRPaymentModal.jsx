import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  Clock,
  Sparkles,
  Smartphone,
  Info,
} from "lucide-react";
import { generateBakongQr, checkPaymentStatus } from "../../Api/paymentApi";

export default function KHQRPaymentModal({
  isOpen,
  onClose,
  rentalId,
  amount,
  calculation,
  propertyName = "Luxury Villa Residence",
  roomName = "Luxury Suite",
  onPaymentSuccess,
}) {
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [copiedAccount, setCopiedAccount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 min expiry
  const [showItemized, setShowItemized] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const pollTimerRef = useRef(null);

  // 1. Generate or fetch dynamic Bakong KHQR when modal opens or currency toggles
  useEffect(() => {
    if (!isOpen || !rentalId) return;

    let isMounted = true;

    // Reset polling before requesting a new currency/QR
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    const fetchQr = async () => {
      try {
        setLoading(true);
        const res = await generateBakongQr(rentalId, currency);
        const data = res?.data?.data || res?.data;

        if (isMounted && data) {
          setQrData(data);
          setPaymentId(data.payment_id);
          setCountdown(300);
        }
      } catch (err) {
        console.error("Failed to generate Bakong KHQR:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQr();

    return () => {
      isMounted = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isOpen, rentalId, currency]);

  // 2. Active Polling to detect payment completion
  useEffect(() => {
    if (!isOpen || !paymentId || isSuccess) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const res = await checkPaymentStatus(paymentId);
        const data = res?.data || {};

        if (data.confirmed || data.status === "success") {
          setIsSuccess(true);
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }

          setTimeout(() => {
            if (onPaymentSuccess) {
              onPaymentSuccess({
                paymentId,
                rentalId,
                amount: qrData?.amount || amount,
                currency,
                transactionCode: qrData?.md5,
                merchant: qrData?.merchant?.name || "POR PECH",
                paidAt: data.paid_at || new Date().toISOString(),
              });
            }
          }, 1600);
        }
      } catch (err) {
        // Polling network drop tolerated
      }
    };

    pollTimerRef.current = setInterval(pollStatus, 3000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isOpen, paymentId, isSuccess, qrData, amount, currency, rentalId, onPaymentSuccess]);

  // 3. Countdown timer
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(""), 2000);
  };

  // Instant simulator for testing
  const handleSimulatePayment = async () => {
    if (!paymentId || isSimulating) return;
    try {
      setIsSimulating(true);
      const res = await checkPaymentStatus(paymentId, true);
      const data = res?.data || {};

      if (data.confirmed) {
        setIsSuccess(true);
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }

        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess({
              paymentId,
              rentalId,
              amount: qrData?.amount || amount,
              currency,
              transactionCode: qrData?.md5,
              merchant: qrData?.merchant?.name || "POR PECH",
              paidAt: data.paid_at || new Date().toISOString(),
            });
          }
        }, 1400);
      }
    } catch (e) {
      console.error("Simulation failed:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = String(countdown % 60).padStart(2, "0");

  const calc = qrData?.calculation || calculation || {
    nights: 1,
    nightly_rate: amount,
    base_price: amount,
    service_fee: 0,
    cleaning_fee: 0,
    deposit: 0,
    total_amount: amount,
  };

  const merchantName = qrData?.merchant?.name || "POR PECH";
  const merchantAccount = qrData?.merchant?.account || (currency === "KHR" ? "005381526@aba" : "005381524@aba");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 text-slate-800 transition-all">
        
        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-200 shadow-lg">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5B869] block">
                Bakong Instant Settlement
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                Payment Verified!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Transaction confirmed with NBC Bakong Network.
              </p>
            </div>

            <div className="bg-[#06241e] text-white p-4 rounded-2xl text-left text-xs space-y-2.5 shadow-inner">
              <div className="flex justify-between items-center text-[#8FA8A3]">
                <span>Merchant:</span>
                <span className="font-bold text-white">{merchantName}</span>
              </div>
              <div className="flex justify-between items-center text-[#8FA8A3]">
                <span>Settled Amount:</span>
                <span className="font-mono font-bold text-[#E5B869] text-sm">
                  {currency === "USD"
                    ? `$${Number(qrData?.amount || amount).toFixed(2)}`
                    : `${Number(qrData?.amount || amount).toLocaleString()} ៛`}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#8FA8A3]">
                <span>Hash Ref (MD5):</span>
                <span className="font-mono text-[10px] text-emerald-300 truncate max-w-[170px]">
                  {qrData?.md5 || "Confirmed"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 animate-pulse">
              Finalizing your luxury reservation details...
            </p>
          </div>
        ) : (
          <>
            {/* OFFICIAL BAKONG KHQR HEADER */}
            <div className="bg-[#E1251B] px-6 py-3.5 text-white flex items-center justify-between shadow-md relative">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tighter font-sans uppercase">
                  KHQR
                </span>
                <div className="h-4 w-[1px] bg-white/30" />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                  Bakong Dynamic
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{minutes}:{seconds}</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* MODAL MAIN CONTENT */}
            <div className="p-6 text-center space-y-4">
              {/* Merchant Title */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Individual Merchant
                </p>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  {merchantName}
                </h3>
                <p className="text-[11px] text-stone-500 truncate max-w-[300px] mx-auto mt-0.5">
                  {propertyName} • <span className="font-medium text-slate-700">{roomName}</span>
                </p>
              </div>

              {/* Currency Selector & Dynamic Amount */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 shadow-inner">
                <div className="flex justify-center gap-1.5 mb-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      currency === "USD"
                        ? "bg-[#06241e] text-[#E5B869] shadow-sm"
                        : "text-stone-500 hover:text-slate-900"
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("KHR")}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      currency === "KHR"
                        ? "bg-[#06241e] text-[#E5B869] shadow-sm"
                        : "text-stone-500 hover:text-slate-900"
                    }`}
                  >
                    KHR (៛)
                  </button>
                </div>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
                    {currency === "USD"
                      ? `$${Number(qrData?.amount || amount || 0).toFixed(2)}`
                      : `${Number(qrData?.amount || Math.round(Number(amount || 0) * 4100)).toLocaleString()} ៛`}
                  </span>
                </div>
              </div>

              {/* QR CODE DISPLAY */}
              <div className="relative mx-auto w-[230px] h-[230px] p-3 rounded-2xl bg-white border border-stone-200 shadow-md flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-2 text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E1251B]" />
                    <span className="text-[11px] font-medium">Generating EMVCo KHQR...</span>
                  </div>
                ) : qrData?.qr_string ? (
                  <div className="relative">
                    <QRCodeSVG
                      value={qrData.qr_string}
                      size={204}
                      level="M"
                      includeMargin={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-9 h-9 rounded-full bg-[#E1251B] border-2 border-white flex items-center justify-center shadow-md">
                        <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                          <span className="text-[8px] font-black text-white">★</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-stone-400">No QR Code Available</div>
                )}

                <div className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <Smartphone className="w-3.5 h-3.5 text-[#E1251B]" />
                <span>Scan with <strong>ABA Mobile, Bakong</strong> or any KHQR Bank</span>
              </div>

              {/* Itemized Breakdown */}
              <div className="border-t border-stone-100 pt-2 text-left">
                <button
                  type="button"
                  onClick={() => setShowItemized(!showItemized)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-stone-600 hover:text-slate-900 cursor-pointer py-1"
                >
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#E5B869]" />
                    <span>View Stay Cost Breakdown</span>
                  </span>
                  <span className="text-stone-400">{showItemized ? "▲ Hide" : "▼ Details"}</span>
                </button>

                {showItemized && (
                  <div className="mt-2 bg-stone-50 rounded-xl p-3 text-[11px] space-y-1.5 border border-stone-200/60 animate-in fade-in duration-150">
                    <div className="flex justify-between text-stone-500">
                      <span>
                        Stay ({calc.nights || 1} nights × ${Number(calc.nightly_rate || amount).toFixed(2)}):
                      </span>
                      <span className="font-semibold text-slate-800">
                        ${Number(calc.base_price || amount).toFixed(2)}
                      </span>
                    </div>

                    {Number(calc.service_fee) > 0 && (
                      <div className="flex justify-between text-stone-500">
                        <span>VIP Service Fee:</span>
                        <span className="font-semibold text-slate-800">
                          ${Number(calc.service_fee).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {Number(calc.cleaning_fee) > 0 && (
                      <div className="flex justify-between text-stone-500">
                        <span>Sanitation & Cleaning:</span>
                        <span className="font-semibold text-slate-800">
                          ${Number(calc.cleaning_fee).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {Number(calc.deposit) > 0 && (
                      <div className="flex justify-between text-stone-500">
                        <span>Refundable Security Deposit:</span>
                        <span className="font-semibold text-slate-800">
                          ${Number(calc.deposit).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-stone-200 pt-1 flex justify-between font-bold text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-[#06241e] font-mono">
                        {currency === "USD"
                          ? `$${Number(qrData?.amount || amount).toFixed(2)}`
                          : `${Number(qrData?.amount || Math.round(Number(amount) * 4100)).toLocaleString()} ៛`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Merchant Account Quick Copy */}
              <div className="bg-[#06241e] text-white p-3 rounded-2xl text-[11px] space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[#8FA8A3]">Merchant Account:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(merchantAccount, "acc")}
                    className="font-mono text-[#E5B869] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{merchantAccount}</span>
                    {copiedAccount === "acc" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-70" />
                    )}
                  </button>
                </div>
              </div>

              {/* Simulation Trigger */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>NBC Open API Active Polling</span>
                </span>

                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating || !paymentId}
                  className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Simulate bank app confirmation"
                >
                  {isSimulating ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-2.5 h-2.5" />
                  )}
                  <span>Simulate Pay</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}