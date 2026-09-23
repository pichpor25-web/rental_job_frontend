import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Building2, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { verifyOtp, sendOtp } from "../../Api/authApi";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user identifier & method passed from forgot password
  const identifier = location.state?.identifier || "";
  const deliveryMethod = location.state?.deliveryMethod || "email";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef([]);

  // Redirect back if user visits URL directly without an identifier
  useEffect(() => {
    if (!identifier) {
      navigate("/forgot-password");
    }
  }, [identifier, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance cursor to the next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move backward on backspace if current cell is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus last filled box
    const nextIndex = digits.length < 6 ? digits.length : 5;
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp({
        otp: code,
      });

      const nextIdentifier = response?.data?.identifier || identifier;

      // Proceed to reset password screen
      navigate("/reset-password", { state: { identifier: nextIdentifier } });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid or expired verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resending) return;

    try {
      setResending(true);
      setError("");
      await sendOtp({ identifier, delivery_method: deliveryMethod });
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to resend verification code.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans text-slate-800">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        {/* Left Column: Form */}
        <div className="p-8 sm:p-12 md:p-14 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              PropertyHub
            </span>
          </div>

          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Verify OTP
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              We have sent a 6-digit verification code to{" "}
              <span className="font-semibold text-slate-800">{identifier}</span>
              .
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 6 OTP Input Boxes */}
            <div
              className="flex items-center justify-between gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-2xl bg-slate-50 border transition focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white ${
                    digit
                      ? "border-slate-400 bg-white text-slate-900"
                      : "border-slate-200 text-slate-700"
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "VERIFYING..." : "VERIFY CODE"}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Link>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || resending}
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`}
                />
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Hero Image */}
        <div className="p-3 hidden md:block">
          <div className="w-full h-full rounded-2xl overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
              alt="Property"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
