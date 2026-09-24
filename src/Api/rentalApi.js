import API from "./axios";

export const fetchRentals = (params) => API.get("/rentals", { params });
export const fetchRentalById = (id) => API.get(`/rentals/${id}`);
export const createRental = (data) => API.post("/rentals", data);
export const updateRental = (id, data) => API.put(`/rentals/${id}`, data);
export const updateRentalStatus = (id, data) =>
  API.put(`/rentals/${id}/status`, data);
export const deleteRental = (id) => API.delete(`/rentals/${id}`);
