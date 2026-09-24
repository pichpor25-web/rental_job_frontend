import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getToken,
  getUser,
  saveSession,
  clearSession,
  isAdminUser,
  isTenantUser,
} from "../utils/auth";
import { fetchUserProfile, logoutUser } from "../Api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(true);

  // Sync / refresh profile if token is present on initial load
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await fetchUserProfile();
        const profile = response?.data || response;
        if (isMounted && profile && profile.id) {
          setUser(profile);
          saveSession(storedToken, profile);
        }
      } catch (err) {
        // If 401 unauthorized, token has expired or is invalid
        if (err?.response?.status === 401) {
          clearSession();
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((newToken, newUser) => {
    saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors on logout API call
    } finally {
      clearSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = isAdminUser(user);
  const isTenant = isTenantUser(user);

  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isTenant,
    loading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
