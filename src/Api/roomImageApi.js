import API from "./axios";

export const fetchAllRoomImages = (params) =>
  API.get("/room-images", { params });

export const uploadRoomImages = (roomId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("images[]", file));

  return API.post(`/rooms/${roomId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateRoomImage = (imageId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  // PHP doesn't parse multipart bodies on PUT, so spoof the method via POST
  formData.append("_method", "PUT");

  return API.post(`/room-images/${imageId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteRoomImage = (imageId) =>
  API.delete(`/room-images/${imageId}`);
