import API from "./axios";

export const fetchProperties = (params) => API.get("/properties", { params });
export const fetchProperty = (id) => API.get(`/properties/${id}`);
export const fetchPropertyById = fetchProperty;
export const createProperty = (data) => API.post("/properties", data);
export const updateProperty = (id, data) => API.put(`/properties/${id}`, data);
export const deleteProperty = (id) => API.delete(`/properties/${id}`);
