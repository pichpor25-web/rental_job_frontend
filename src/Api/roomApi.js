import API from "./axios";

export const fetchRooms = (params) => API.get("/rooms", { params });
export const fetchRoom = (id) => API.get(`/rooms/${id}`);
export const fetchRoomById = fetchRoom;
export const createRoom = (data) => {
  if (data instanceof FormData) {
    const propertyId = data.get("property_id");
    data.delete("property_id");
    return API.post(`/properties/${propertyId}/rooms`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  const { property_id: propertyId, ...payload } = data;
  return API.post(`/properties/${propertyId}/rooms`, payload);
};
export const updateRoom = (id, data) => {
  if (data instanceof FormData) {
    data.set("_method", "PUT");
    return API.post(`/rooms/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  return API.put(`/rooms/${id}`, data);
};
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);
