import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verifying permissions...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page with return URL
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${returnUrl}`} replace />;
  }

  // If logged in as regular user (not admin), block access to admin and send to homepage
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin access granted
  return children ? children : <Outlet />;
}
