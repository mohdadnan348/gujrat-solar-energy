"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "../lib/axios";

const AuthContext = createContext(null);

const TOKEN_KEY = "gse_access_token";
const USER_KEY = "gse_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveAuth = useCallback((userData, token) => {
    if (typeof window === "undefined") return;

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }

    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  const clearAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await axios.post("/auth/login", credentials);

      const responseData = response?.data?.data || response?.data;

      const token =
        responseData?.token ||
        responseData?.accessToken ||
        response?.data?.token ||
        response?.data?.accessToken;

      const userData =
        responseData?.user ||
        response?.data?.user ||
        null;

      if (!token) {
        throw new Error("Authentication token was not returned by the server.");
      }

      saveAuth(userData, token);

      return {
        success: true,
        user: userData,
        token,
        data: responseData,
      };
    },
    [saveAuth]
  );

  const fetchCurrentUser = useCallback(async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(TOKEN_KEY)
        : null;

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await axios.get("/auth/me");

      const responseData = response?.data?.data || response?.data;

      const currentUser =
        responseData?.user ||
        responseData ||
        null;

      if (currentUser) {
        saveAuth(currentUser, token);
      }

      return currentUser;
    } catch (error) {
      if (error?.response?.status === 401) {
        clearAuth();
      }

      throw error;
    }
  }, [clearAuth, saveAuth]);

  const logout = useCallback(async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      // Clear local authentication even if the server request fails.
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (!token) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (storedUser && mounted) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem(USER_KEY);
          }
        }

        await fetchCurrentUser();
      } catch (error) {
        if (error?.response?.status === 401) {
          clearAuth();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [clearAuth, fetchCurrentUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      fetchCurrentUser,
      clearAuth,
      saveAuth,
    }),
    [
      user,
      loading,
      login,
      logout,
      fetchCurrentUser,
      clearAuth,
      saveAuth,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};

export default AuthContext;