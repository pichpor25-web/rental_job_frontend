import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../pages/admin/Sidebar";
import { fetchProperties } from "../Api/propertyApi";
import { fetchRooms } from "../Api/roomApi";
import { fetchUsers } from "../Api/userApi";
import { fetchRentals } from "../Api/rentalApi";
import { fetchRentalRequests } from "../Api/rentalRequestApi";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "../components/common/ProfileModal";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const loadAllData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);

      const [propsRes, roomsRes, usersRes, rentalsRes, reqsRes] =
        await Promise.allSettled([
          fetchProperties(),
          fetchRooms(),
          fetchUsers(),
          fetchRentals(),
          fetchRentalRequests(),
        ]);

      if (propsRes.status === "fulfilled" && Array.isArray(propsRes.value?.data)) {
        setProperties(propsRes.value.data);
      }
      if (roomsRes.status === "fulfilled" && Array.isArray(roomsRes.value?.data)) {
        setRooms(roomsRes.value.data);
      }
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value?.data)) {
        setUsers(usersRes.value.data);
      }
      if (rentalsRes.status === "fulfilled" && Array.isArray(rentalsRes.value?.data)) {
        setRentals(rentalsRes.value.data);
      }
      if (reqsRes.status === "fulfilled" && Array.isArray(reqsRes.value?.data)) {
        setRentalRequests(reqsRes.value.data);
      }
    } catch (err) {
      console.error("AdminLayout: error loading admin data", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(
      (r) => (r.status || "available").toLowerCase() === "available"
    ).length;
    const occupiedRooms = totalRooms - availableRooms;
    const totalUsers = users.length;
    const totalRentals = rentals.length;
    const totalRequests = rentalRequests.length;

    const totalPotentialRevenue = rooms.reduce((acc, r) => {
      const price = Number(r.price) || 0;
      return acc + price;
    }, 0);

    return {
      totalProperties,
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalUsers,
      totalRentals,
      totalRequests,
      totalPotentialRevenue,
    };
  }, [properties, rooms, users, rentals, rentalRequests]);

  const contextValue = {
    properties,
    rooms,
    users,
    rentals,
    rentalRequests,
    stats,
    loading,
    isRefreshing,
    refreshAllData: () => loadAllData(true),
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto">
        <Outlet context={contextValue} />
      </main>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}

export default AdminLayout;
