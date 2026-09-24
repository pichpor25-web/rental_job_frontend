import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateUser, uploadUserAvatar } from "../../Api/userApi";
import { getAvatarUrl, saveSession, getToken } from "../../utils/auth";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
      });
      setPreviewAvatar(getAvatarUrl(user));
      setSelectedFile(null);
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 2MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewAvatar(objectUrl);
    setSelectedFile(file);
    setErrorMessage("");

    try {
      setAvatarLoading(true);
      const response = await uploadUserAvatar(user.id, file);
      const updatedUser = response?.data?.data || response?.data?.user || response?.data;
      if (updatedUser && updatedUser.id) {
        setUser(updatedUser);
        const token = getToken();
        if (token) saveSession(token, updatedUser);
        setSuccessMessage("Profile photo updated successfully!");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to upload profile photo.";
      setErrorMessage(msg);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.password && formData.password.trim().length >= 8) {
        payload.password = formData.password.trim();
      }

      const response = await updateUser(user.id, payload);
      const updatedUser = response?.data?.data || response?.data;

      if (updatedUser && updatedUser.id) {
        setUser(updatedUser);
        const token = getToken();
        if (token) saveSession(token, updatedUser);
        setSuccessMessage("Profile information updated successfully!");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update profile information.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = previewAvatar || getAvatarUrl(user);
  const avatarLetter = (user?.name || "U").charAt(0).toUpperCase();
  const roleName =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "owner"
        ? "Property Owner"
        : "Tenant";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#0b1f3a] px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#dcae4d] p-2 text-[#0b1f3a]">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">My Profile</h3>
              <p className="text-xs text-slate-300">View and update your personal information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-900 shadow-md">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={() => setPreviewAvatar(null)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#dcae4d] text-3xl font-extrabold text-[#0b1f3a]">
                    {avatarLetter}
                  </div>
                )}

                {avatarLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                title="Change profile picture"
                className="absolute bottom-0 right-0 rounded-full bg-slate-900 p-2 text-white shadow-lg transition hover:bg-slate-800 active:scale-90 cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700">Click camera icon to change photo</p>
              <p className="text-[11px] text-slate-400">JPG, PNG or WEBP (Max 2MB)</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  user.role === "admin"
                    ? "bg-violet-100 text-violet-700 border border-violet-200"
                    : user.role === "owner"
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                <Shield className="h-3 w-3" />
                {roleName}
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  user.is_active
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                New Password (leave blank to keep current)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading || avatarLoading}
                className="flex items-center gap-2 rounded-xl bg-[#0b1f3a] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#134074] transition active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
