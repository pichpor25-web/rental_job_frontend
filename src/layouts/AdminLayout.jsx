import { Outlet } from "react-router-dom";
import Sidebar from "../pages/admin/Sidebar";

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
