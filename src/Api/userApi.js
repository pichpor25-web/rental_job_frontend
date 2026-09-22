import API from "./axios";

export const fetchUsers = (params) => API.get("/users", { params });
export const fetchUserById = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
