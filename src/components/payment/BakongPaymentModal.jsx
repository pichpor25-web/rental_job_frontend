import React, { useState, useEffect, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generateBakongQr } from "../../Api/paymentApi";
import {
  X,
  Check,
  Copy,
  ArrowRight,
  Loader2,
  Clock,
  RotateCw,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

// Official CRC-16 (CCITT-FALSE) lookup table for EMVCo KHQR
const CRC16_TABLE = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
  0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
  0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
  0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
  0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
  0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
  0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
  0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
  0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
  0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
  0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
  0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
  0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
  0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
  0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
  0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
  0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
  0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
  0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
  0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
  0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
  0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
  0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
  0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
  0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0,
];

function calculateCRC16(str) {
  const bytes = new TextEncoder().encode(str);
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    const j = (c ^ (crc >> 8)) & 0xff;
    crc = (CRC16_TABLE[j] ^ (crc << 8)) & 0xffff;
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function formatTag(id, val) {
  const s = String(val);
  return id + s.length.toString().padStart(2, "0") + s;
}

function generateDynamicKHQR({
  bakongAccountId,
  merchantName,
  merchantCity = "Phnom Penh",
  currency = "USD",
  amount = 0,
  timestamp = Date.now(),
}) {
  const isUSD = currency === "USD";
  const now = timestamp;
  const exp = now + 15 * 60 * 1000;

  const subTag00 = formatTag("00", bakongAccountId);
  const tag29 = formatTag("29", subTag00);

  const subTag99_00 = formatTag("00", String(now));
  const subTag99_01 = formatTag("01", String(exp));
  const tag99 = formatTag("99", subTag99_00 + subTag99_01);

  let amountStr = "";
  if (amount > 0) {
    amountStr = isUSD ? Number(amount).toFixed(2) : String(Math.round(amount));
  }

  let raw = "";
  raw += formatTag("00", "01");
  raw += formatTag("01", "12");
  raw += tag29;
  raw += formatTag("52", "5999");
  raw += formatTag("53", isUSD ? "840" : "116");
  if (amountStr) {
    raw += formatTag("54", amountStr);
  }
  raw += formatTag("58", "KH");
  raw += formatTag("59", merchantName);
  raw += formatTag("60", merchantCity);
  raw += tag99;
  raw += "6304";

  const checksum = calculateCRC16(raw);
  return raw + checksum;
}

export default function BakongPaymentModal({
  isOpen,
  onClose,
  amount,
  paymentId,
  propertyName,
  roomName,
  onPaymentSuccess,
}) {
  const [currency, setCurrency] = useState("USD");
  const [copiedAccount, setCopiedAccount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [countdown, setCountdown] = useState(15 * 60);

  useEffect(() => {
    if (isOpen) {
      setQrTimestamp(Date.now());
      setCountdown(15 * 60);
      setIsPaid(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isPaid) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPaid]);

  const amountUSD = Number(amount) || 0;
  const amountKHR = Math.round(amountUSD * 4100);

  // FIXED: changed @abaa to @aba
  const khqrString = useMemo(() => {
    const bakongAccountId =
      currency === "USD" ? "005381524@aba" : "005381526@aba";
    const currentAmount = currency === "USD" ? amountUSD : amountKHR;

    return generateDynamicKHQR({
      bakongAccountId,
      merchantName: "POR PECH",
      merchantCity: "Phnom Penh",
      currency,
      amount: currentAmount,
      timestamp: qrTimestamp,
    });
  }, [currency, amountUSD, amountKHR, qrTimestamp]);

  // Automated status check against Laravel API every 3 seconds
  useEffect(() => {
    if (!isOpen || !paymentId || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/payments/${paymentId}/check-status`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();

        if (data.confirmed || data.status === "success") {
          setIsPaid(true);
          clearInterval(interval);
          setTimeout(() => {
            onPaymentSuccess(data.payment);
          }, 1500);
        }
      } catch (err) {
        console.error("Payment polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, paymentId, isPaid, onPaymentSuccess]);

  if (!isOpen) return null;

  const handleRefreshQR = () => {
    setQrTimestamp(Date.now());
    setCountdown(15 * 60);
  };

  const handleCopy = (accNumber, type) => {
    navigator.clipboard.writeText(accNumber.replace(/\s+/g, ""));
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(""), 2500);
  };

  // Manual Check Trigger Button
  const handleManualCheck = async (e) => {
    e.preventDefault();
    if (!paymentId) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/payments/${paymentId}/check-status`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();

      if (data.confirmed || data.status === "success") {
        setIsPaid(true);
        setTimeout(() => {
          onPaymentSuccess(data.payment);
        }, 1200);
      } else {
        alert("Payment not detected yet. Please ensure you confirmed the transfer in your banking app.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify transaction status.");
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = String(countdown % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 text-slate-800">
        
        {/* Top Banner */}
        <div className="bg-[#E1251B] px-6 py-3.5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="bg-white text-[#E1251B] font-black px-2 py-0.5 rounded text-xs tracking-wider font-mono">
              KHQR
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider text-white">
              Bakong Dynamic
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isPaid && (
              <div
                className={`text-xs font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold ${
                  countdown < 120
                    ? "bg-amber-400 text-slate-900 animate-pulse"
                    : "bg-white/20 text-white"
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{minutes}:{seconds}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition text-xs font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-4 max-h-[85vh] overflow-y-auto">
          {isPaid ? (
            <div className="py-8 space-y-3">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Payment Confirmed!</h3>
              <p className="text-xs text-stone-500">
                Your transaction has been verified by the Bakong switch network.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Official Merchant Payee
                </p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  POR PECH
                </h3>
                <p className="text-xs text-stone-500 mt-1 flex items-center justify-center gap-1 truncate max-w-xs mx-auto">
                  <span className="truncate">{propertyName}</span>
                  {roomName && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 truncate">{roomName}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Amount Display */}
              <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 shadow-inner">
                <div className="flex justify-center gap-2 mb-2">
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

                <div className="text-3xl sm:text-4xl font-black text-[#06241e] tracking-tight font-mono">
                  {currency === "USD"
                    ? `$${amountUSD.toFixed(2)}`
                    : `${amountKHR.toLocaleString()} ៛`}
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  EMVCo Dynamic KHQR with instant verification
                </p>
              </div>

              {/* Scannable QR Code */}
              <div className="relative mx-auto w-[230px] h-[230px] p-3.5 bg-white rounded-2xl border-2 border-stone-200 shadow-md flex items-center justify-center">
                {countdown === 0 ? (
                  <div className="flex flex-col items-center gap-2 text-stone-500">
                    <p className="text-xs font-semibold">QR Code Expired</p>
                    <button
                      type="button"
                      onClick={handleRefreshQR}
                      className="px-3 py-1.5 bg-[#06241e] text-[#E5B869] rounded-full text-xs font-bold flex items-center gap-1.5 shadow hover:scale-105 transition cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Generate New QR</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    <QRCodeSVG
                      value={khqrString}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-[#E1251B] border-2 border-white flex items-center justify-center shadow-lg">
                        <span className="text-[9px] font-black text-white font-serif">
                          KH
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Supported Banking Apps */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <Smartphone className="w-3.5 h-3.5 text-[#E1251B]" />
                <span>
                  Scan with <strong>ABA Mobile, Wing, ACLEDA</strong> or Bakong
                </span>
              </div>

              {/* Copyable Account Numbers */}
              <div className="space-y-2 text-xs text-left bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">USD Account:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("005 381 524", "USD")}
                    className="font-mono font-bold text-slate-900 hover:text-[#B78A52] flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-stone-200 transition"
                  >
                    <span>005 381 524</span>
                    {copiedAccount === "USD" ? (
                      <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">KHR Account:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy("005 381 526", "KHR")}
                    className="font-mono font-bold text-slate-900 hover:text-[#B78A52] flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-stone-200 transition"
                  >
                    <span>005 381 526</span>
                    {copiedAccount === "KHR" ? (
                      <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Auto-detect Status Indicator & Manual Check */}
              <div className="pt-2">
                <div className="flex items-center justify-center gap-2 text-xs text-stone-500 mb-3">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E1251B]" />
                  <span>Waiting for your bank transfer...</span>
                </div>

                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full bg-[#06241e] hover:bg-[#0c3a30] text-[#E5B869] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E5B869]" />
                      <span>Checking Status...</span>
                    </>
                  ) : (
                    <>
                      <span>Check Payment Status</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}