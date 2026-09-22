import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  Building2,
  BedSingle,
  MoreHorizontal,
  Edit,
  Plus,
  ChevronDown,
  RefreshCw,
  Eye,
} from "lucide-react";
import { fetchProperties } from "../../Api/propertyApi";
import { fetchRooms } from "../../Api/roomApi";
import {
  fetchAllRoomImages,
  uploadRoomImages,
  updateRoomImage,
  deleteRoomImage,
} from "../../Api/roomImageApi";

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed top-5 right-5 z-[70] flex items-start gap-3 max-w-sm w-full px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-2 duration-200 ${
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-800"
      }`}
      role="alert"
    >
      {isError ? (
        <AlertTriangle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
      ) : (
        <Check className="w-4.5 h-4.5 mt-0.5 shrink-0" />
      )}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-current/60 hover:text-current shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Format raw file sizes cleanly
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Modal to View Full-Size Image & Meta Information
function ViewModal({ isOpen, onClose, image, onOpenEdit }) {
  if (!isOpen || !image) return null;

  const currentUrl = image.full_url || image.image_path;
  const roomNumber = image.room_number || image.room?.room_number || image.room_id;
  const propertyName = image.property_name || image.room?.property?.name || "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              Image #{image.id}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-600">
              Room {roomNumber} ({propertyName})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Image Display Container */}
        <div className="bg-slate-950 flex items-center justify-center max-h-[60vh] overflow-hidden p-2">
          <img
            src={currentUrl}
            alt={`Room ${roomNumber}`}
            className="max-h-[58vh] max-w-full object-contain rounded-lg"
          />
        </div>

        {/* Modal Actions & Details Footer */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="text-xs text-slate-500 space-y-1">
            <p>
              <span className="font-semibold text-slate-700">Uploaded:</span>{" "}
              {image.created_at
                ? new Date(image.created_at).toLocaleString()
                : "N/A"}
            </p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
            >
              <span>Open raw image file</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEdit(image);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Replace Image</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal to Edit / Replace an existing image
function EditModal({ isOpen, onClose, onUpdate, image, updating }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (!isOpen || !image) return null;

  const currentUrl = image.full_url || image.image_path;
  const roomNumber = image.room_number || image.room?.room_number || image.room_id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a new image file to replace the current one.");
      return;
    }
    await onUpdate(image.id, selectedFile);
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Replace Image #{image.id}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned to Room {roomNumber}
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Current Photo
              </span>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={currentUrl}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                New Photo
              </span>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="New Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-400 block">
                      No file chosen
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Choose Replacement File
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-4 transition cursor-pointer group">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition mb-1" />
              <span className="text-xs font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : "Select a new photo"}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {selectedFile ? formatFileSize(selectedFile.size) : "PNG, JPG, WEBP"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating || !selectedFile}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Update Image</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Upload Modal with Enhanced File List Preview
function UploadModal({
  isOpen,
  onClose,
  onUpload,
  uploading,
  rooms,
  properties,
}) {
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [fileItems, setFileItems] = useState([]);

  const allRoomsList = useMemo(() => {
    const list = [];
    const propertyNames = new Map(
      properties.map((property) => [
        String(property.id),
        property.name || `Property ${property.id}`,
      ]),
    );

    rooms.forEach((room) => {
      const roomId = room.id ?? room.room_id;
      if (roomId === undefined || roomId === null) return;

      list.push({
        id: roomId,
        number: room.room_number || room.number || roomId,
        propertyName:
          room.property?.name ||
          room.property_name ||
          propertyNames.get(String(room.property_id)) ||
          "Unassigned Property",
      });
    });
    return list;
  }, [rooms, properties]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newItems = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFileItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const handleRemoveFile = (idToRemove) => {
    setFileItems((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleReset = () => {
    fileItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setSelectedRoomId("");
    setFileItems([]);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      alert("Please select a Room ID.");
      return;
    }
    if (!fileItems.length) {
      alert("Please select at least one image file.");
      return;
    }

    const rawFiles = fileItems.map((item) => item.file);
    await onUpload(selectedRoomId, rawFiles);
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Upload Room Images
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a Room ID to add new photo assets
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Select Room / Room ID
            </label>
            <div className="relative">
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
                className="w-full appearance-none px-4 py-3 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="">Select Room ID</option>
                {allRoomsList.length > 0 ? (
                  allRoomsList.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.number} (ID: #{room.id}) — {room.propertyName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No rooms available
                  </option>
                )}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center gap-1">
                <BedSingle className="w-4 h-4" />
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Upload Images
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-5 transition cursor-pointer group">
              <Upload className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 transition mb-1.5" />
              <span className="text-xs font-semibold text-slate-700">
                Click to choose files
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Supports PNG, JPG, WEBP
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {fileItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Selected Files ({fileItems.length})
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {fileItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/60 p-2 rounded-2xl group hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(item.file.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedRoomId || fileItems.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Upload</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Action Dropdown Menu
function ActionMenu({
  img,
  onOpenViewModal,
  onOpenEditModal,
  onDelete,
  isDeleting,
  isUpdating,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
      >
        {isDeleting || isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreHorizontal className="w-5 h-5" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-2xl shadow-lg border border-slate-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => {
              setOpen(false);
              onOpenViewModal(img);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>View Details</span>
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onOpenEditModal(img);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit className="w-4 h-4 text-slate-500" />
            <span>Replace Image</span>
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onDelete(img.id);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Delete Image</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function RoomImageManagement() {
  const [images, setImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState("ALL");

  const [toast, setToast] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [updatingImageId, setUpdatingImageId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEditImage, setSelectedEditImage] = useState(null);
  const [selectedViewImage, setSelectedViewImage] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  const loadData = async () => {
    try {
      setLoading(true);
      const [imagesRes, roomsRes, propsRes] = await Promise.all([
        fetchAllRoomImages(),
        fetchRooms(),
        fetchProperties(),
      ]);

      const rawImages = Array.isArray(imagesRes?.data)
        ? imagesRes.data
        : Array.isArray(imagesRes)
          ? imagesRes
          : [];

      setImages(rawImages);

      const rawRooms = Array.isArray(roomsRes?.data)
        ? roomsRes.data
        : Array.isArray(roomsRes?.data?.data)
          ? roomsRes.data.data
          : Array.isArray(roomsRes)
            ? roomsRes
            : [];

      setRooms(rawRooms);

      const rawProps = Array.isArray(propsRes?.data?.data)
        ? propsRes.data.data
        : Array.isArray(propsRes?.data)
          ? propsRes.data
          : Array.isArray(propsRes)
            ? propsRes
            : [];

      setProperties(rawProps);
    } catch (error) {
      console.error("Failed to fetch room image data:", error);
      showToast("error", "Couldn't load room images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return images.filter((img) => {
      const roomNum = String(
        img.room_number || img.room?.room_number || "",
      ).toLowerCase();
      const propName = String(
        img.property_name || img.room?.property?.name || "",
      ).toLowerCase();
      const path = String(img.image_path || "").toLowerCase();

      const matchesSearch =
        !q || roomNum.includes(q) || propName.includes(q) || path.includes(q);

      const matchesProperty =
        selectedPropertyFilter === "ALL" ||
        String(img.property_id || img.room?.property_id) ===
          selectedPropertyFilter;

      return matchesSearch && matchesProperty;
    });
  }, [images, searchQuery, selectedPropertyFilter]);

  const handleDeleteImage = async (imageId) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      setDeletingImageId(imageId);
      await deleteRoomImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      showToast("success", "Image deleted successfully.");
    } catch (error) {
      console.error("Failed to delete image:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to delete image.",
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleReplaceImage = async (imageId, file) => {
    if (!file) return;

    try {
      setUpdatingImageId(imageId);
      const response = await updateRoomImage(imageId, file);
      const updatedImg = response.data?.data || response.data || {};

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, ...updatedImg } : img,
        ),
      );
      showToast("success", "Image updated successfully!");
    } catch (error) {
      console.error("Failed to update image:", error);
      showToast(
        "error",
        error?.response?.data?.message || "Failed to replace image.",
      );
    } finally {
      setUpdatingImageId(null);
    }
  };

  const handleUploadImages = async (roomId, files) => {
    try {
      setUploading(true);
      await uploadRoomImages(roomId, files);
      showToast("success", "Images uploaded successfully!");
      loadData();
    } catch (error) {
      console.error("Failed to upload images:", error);
      showToast("error", "Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Upload New Images Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUploadImages}
        uploading={uploading}
        rooms={rooms}
        properties={properties}
      />

      {/* Replace Image Modal */}
      <EditModal
        isOpen={Boolean(selectedEditImage)}
        onClose={() => setSelectedEditImage(null)}
        onUpdate={handleReplaceImage}
        image={selectedEditImage}
        updating={updatingImageId === selectedEditImage?.id}
      />

      {/* View Full Image Modal */}
      <ViewModal
        isOpen={Boolean(selectedViewImage)}
        onClose={() => setSelectedViewImage(null)}
        image={selectedViewImage}
        onOpenEdit={(imgToEdit) => setSelectedEditImage(imgToEdit)}
      />

      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Room Images Gallery
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage uploaded photos across all property rooms.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Image</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room #, path, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedPropertyFilter}
              onChange={(e) => setSelectedPropertyFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPropertyFilter("ALL");
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Room Images Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Room / Property</th>
                  <th className="py-3 px-4">Full URL</th>
                  <th className="py-3 px-4">Uploaded At</th>
                  <th className="py-3 px-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-5 w-8 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-40 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4 pr-6 text-right">
                        <div className="h-5 w-5 bg-slate-100 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredImages.length > 0 ? (
                  filteredImages.map((img) => {
                    const roomNumber =
                      img.room_number || img.room?.room_number || img.room_id;
                    const propertyName =
                      img.property_name || img.room?.property?.name || "N/A";
                    const fullUrl = img.full_url || img.image_path;

                    return (
                      <tr
                        key={img.id}
                        className="hover:bg-slate-50/60 transition"
                      >
                        <td className="py-4 px-4 font-medium text-slate-900">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            #{img.id}
                          </span>
                        </td>

                        {/* Image Thumbnail (Clicking opens View Modal) */}
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedViewImage(img)}
                            className="block w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group relative text-left"
                          >
                            <img
                              src={fullUrl}
                              alt={`Room ${roomNumber}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        </td>

                        {/* Room & Property */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                              <BedSingle className="w-4 h-4" />
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedViewImage(img)}
                                className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition text-left"
                              >
                                Room {roomNumber}
                              </button>
                              <div className="text-xs text-slate-400 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                <span>{propertyName}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Direct URL link */}
                        <td className="py-4 px-4">
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        {/* Created At */}
                        <td className="py-4 px-4 text-xs text-slate-500">
                          {img.created_at
                            ? new Date(img.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 pr-6 text-right">
                          <ActionMenu
                            img={img}
                            onOpenViewModal={(imageToView) =>
                              setSelectedViewImage(imageToView)
                            }
                            onOpenEditModal={(imageToEdit) =>
                              setSelectedEditImage(imageToEdit)
                            }
                            onDelete={handleDeleteImage}
                            isDeleting={deletingImageId === img.id}
                            isUpdating={updatingImageId === img.id}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <ImageIcon className="w-10 h-10 mx-auto mb-3 stroke-1 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        {images.length === 0
                          ? "No room images uploaded yet."
                          : "No images match your filter criteria."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredImages.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {images.length}
                </span>{" "}
                images
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}