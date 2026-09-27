import API from "./axios";

export const fetchProperties = (params) => API.get("/properties", { params });
export const fetchProperty = (id) => API.get(`/properties/${id}`);
export const fetchPropertyById = fetchProperty;
export const createProperty = (data) =>
  API.post("/properties", data, {
    headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  });
export const updateProperty = (id, data) => {
  if (data instanceof FormData) {
    data.set("_method", "PUT");
    return API.post(`/properties/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  return API.put(`/properties/${id}`, data);
};
export const deleteProperty = (id) => API.delete(`/properties/${id}`);
