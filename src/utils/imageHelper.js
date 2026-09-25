/**
 * Helper to resolve image paths into valid full URLs pointing to the backend storage
 * Note: Always uses IPv4 127.0.0.1:8000 because PHP artisan serve binds to IPv4.
 */
export const resolveImageUrl = (img) => {
  if (!img) return null;
  let path = typeof img === "string" ? img : (img.full_url || img.image_path || img.url || "");
  if (!path || typeof path !== "string") return null;

  // Normalize localhost:8000 to 127.0.0.1:8000 to avoid IPv6 [::1] connection refused in Chrome
  if (path.includes("localhost:8000")) {
    path = path.replace("localhost:8000", "127.0.0.1:8000");
  }

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
  return `http://127.0.0.1:8000/storage/${cleanPath}`;
};

export default resolveImageUrl;
