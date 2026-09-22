import { Navigate, Route, Routes } from "react-router-dom";
import Homepage from "../layouts/Homepage";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
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

function Index() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default Index;
