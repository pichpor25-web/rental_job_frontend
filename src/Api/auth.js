import API from "./axios";

// Public Authentication
export const registerUser = (userData) => API.post("/register", userData);
export const loginUser = (credentials) => API.post("/login", credentials);

// Password Reset & OTP Pipeline
export const sendOtp = (identifier, deliveryMethod) =>
  API.post("/forgot-password/send-otp", {
    identifier,
    delivery_method: deliveryMethod,
  });
export const verifyOtp = (identifier, otp) =>
  API.post("/forgot-password/verify-otp", { identifier, otp });
export const resetPassword = (data) => API.post("/forgot-password/reset", data);

// Protected Routes (Sanctum)
export const fetchUserProfile = () => API.get("/me");
export const logoutUser = () => API.post("/logout");
