/**
 * Helper to resolve image paths into valid full URLs pointing to the backend storage
 */
export const resolveImageUrl = (img) => {
  if (!img) return null;
  const path = typeof img === "string" ? img : (img.full_url || img.image_path || img.url || "");
  if (!path || typeof path !== "string") return null;

  // If already absolute URL or data URI
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  // Strip leading slashes and duplicate storage prefixes
  const cleanPath = path.replace(/^\/?(storage\/)?/, "");
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const backendOrigin = apiBase.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  return `${backendOrigin}/storage/${cleanPath}`;
};

export default resolveImageUrl;
