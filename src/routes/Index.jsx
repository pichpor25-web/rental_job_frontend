import { Navigate, Route, Routes } from "react-router-dom";
import Homepage from "../layouts/Homepage";
import AdminLayout from "../layouts/AdminLayout";
import AdminRoute from "./AdminRoute";
import Dashboard from "../pages/admin/Dashboard";
import UsersManagement from "../pages/admin/Users";
import Properties from "../pages/admin/Properties";
import AddProperties from "../pages/admin/AddProperties";
import LoginPage from "../pages/auth/Login";
import RoomManagement from "../pages/admin/Rooms";
import AddRoomPage from "../pages/admin/AddRooms";
import EditRoomPage from "../pages/admin/EditRooms";
import RoomImageManagement from "../pages/admin/RoomImage";
import RentalRequestManagement from "../pages/admin/RentalRequests";
import ViewRoomPage from "../pages/admin/ViewRooms";
import ViewPropertyPage from "../pages/admin/ViewProperties";
import EditPropertyPage from "../pages/admin/EditProperties";
import ViewRentalRequestPage from "../pages/admin/ViewRentalRequest";
import RegisterPage from "../pages/auth/Register";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import VerifyOtpPage from "../pages/auth/VerifyOTP";
import ResetPasswordPage from "../pages/auth/ResetPassword";
import RentalManagement from "../pages/admin/Rentals";

function Index() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersManagement />} />

        <Route path="properties" element={<Properties />} />
        <Route path="properties/add" element={<AddProperties />} />
        <Route path="properties/view/:id" element={<ViewPropertyPage />} />
        <Route path="properties/edit/:id" element={<EditPropertyPage />} />

        <Route path="rooms" element={<RoomManagement />} />
        <Route path="rooms/add" element={<AddRoomPage />} />
        <Route path="rooms/edit/:id" element={<EditRoomPage />} />
        <Route path="rooms/view/:id" element={<ViewRoomPage />} />

        <Route path="roomimage" element={<RoomImageManagement />} />

        <Route path="rentalrequest" element={<RentalRequestManagement />} />
        <Route path="rentalrequest/:id" element={<ViewRentalRequestPage />} />

        <Route path="rental" element={<RentalManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default Index;
