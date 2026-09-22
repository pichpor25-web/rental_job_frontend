import API from "./axios";

export const fetchRooms = (params) => API.get("/rooms", { params });
export const fetchRoom = (id) => API.get(`/rooms/${id}`);
export const fetchRoomById = fetchRoom;
export const createRoom = ({ property_id, ...data }) =>
  API.post(`/properties/${property_id}/rooms`, data);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);
