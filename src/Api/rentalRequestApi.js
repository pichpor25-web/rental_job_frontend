import API from "./axios";

export const fetchRentalRequests = (params) =>
  API.get("/rental-requests", { params });

export const updateRentalRequestStatus = (id, status) =>
  API.patch(`/rental-requests/${id}/status`, { status });
