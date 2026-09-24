const TOKEN_KEY = "access_token";
const USER_KEY = "user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const isAuthenticated = () => Boolean(getToken());

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

export const isAdminUser = (user) => {
  const current = user || getUser();
  return Boolean(current?.role && current.role.toLowerCase() === "admin");
};

export const isTenantUser = (user) => {
  const current = user || getUser();
  return Boolean(current?.role && current.role.toLowerCase() === "tenant");
};

/**
 * Helper to get the full image URL for avatar regardless of whether
 * it is stored as relative path or absolute URL.
 */
export const getAvatarUrl = (userOrAvatar) => {
  if (!userOrAvatar) return null;
  const avatar =
    typeof userOrAvatar === "object"
      ? userOrAvatar.avatar_url || userOrAvatar.avatar
      : userOrAvatar;

  if (!avatar) return null;
  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("data:") ||
    avatar.startsWith("blob:")
  ) {
    return avatar;
  }
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api";
  const backendBase = apiBase.replace(/\/api\/?$/, "");
  const cleanPath = avatar.startsWith("storage/") ? avatar : `storage/${avatar}`;
  return `${backendBase}/${cleanPath.replace(/^\/+/, "")}`;
};

// Pull the token/user out of a login or register response, whatever
// shape the API wraps them in.
export const extractToken = (response) =>
  response?.data?.access_token ||
  response?.data?.token ||
  response?.data?.data?.access_token ||
  response?.data?.data?.token ||
  null;

export const extractUser = (response) =>
  response?.data?.user ||
  response?.data?.data?.user ||
  (response?.data?.id ? response.data : null);

export const saveSession = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};
