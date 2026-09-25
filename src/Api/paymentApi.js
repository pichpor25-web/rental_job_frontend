import API from "./axios";

// Quick Booking
export const bookRoomStay = (data) => API.post("/rentals/book", data);

// Bakong Dynamic KHQR Generation
export const generateBakongQr = (rentalId, currency = "USD") =>
  API.post(`/rentals/${rentalId}/bakong-qr`, { currency });

// Check Payment Status (Polls NBC Bakong API by MD5)
export const checkPaymentStatus = (paymentId, simulate = false) =>
  API.get(`/payments/${paymentId}/check-status`, {
    params: simulate ? { simulate: true } : {},
  });

// Real-time Stay Cost Calculation
export const calculateStayPrice = (params) =>
  API.post("/pricing/calculate", params);

// Legacy/Admin Payments
export const fetchPayments = () => API.get("/payments");
export const recordManualPayment = (rentalId, data) =>
  API.post(`/rentals/${rentalId}/payments`, data);
export const updatePaymentStatus = (id, data) =>
  API.put(`/payments/${id}/status`, data);
