import API from "./axios";

export const fetchRentalRequests = (params) =>
  API.get("/rental-requests", { params });

export const fetchRentalRequestById = (id) =>
  API.get(`/rental-requests/${id}`);

export const updateRentalRequestStatus = (id, status) =>
  API.put(`/rental-requests/${id}/status`, { status });
