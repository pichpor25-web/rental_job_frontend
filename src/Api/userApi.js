import API from "./axios";

export const fetchUsers = (params) => API.get("/users", { params });

export const fetchUserById = (id) => API.get(`/users/${id}`);

export const createUser = (data) => {
  const isForm = data instanceof FormData;
  return API.post("/users", data, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
};

export const updateUser = (id, data) => {
  if (data instanceof FormData) {
    if (!data.has("_method")) {
      data.append("_method", "PUT");
    }
    return API.post(`/users/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return API.put(`/users/${id}`, data);
};

export const uploadUserAvatar = (id, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return API.post(`/users/${id}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const toggleUserStatus = (id) => API.patch(`/users/${id}/toggle-status`);

export const deleteUser = (id) => API.delete(`/users/${id}`);
