"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";

const AuthContext = createContext(null);

const TOKEN_KEY = "gse_access_token";
const USER_KEY = "gse_user";
const EMPLOYEE_KEY = "gse_employee";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  const saveAuth = useCallback((userData, employeeData, token) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }

    if (employeeData) {
      setEmployee(employeeData);
      localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(employeeData));
    } else {
      setEmployee(null);
      localStorage.removeItem(EMPLOYEE_KEY);
    }

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setEmployee(null);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EMPLOYEE_KEY);
  }, []);

 const login = useCallback(
  async ({ email, password }) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const responseData =
        response?.data?.data || response?.data || {};

      const token = responseData?.token;
      const userData = responseData?.user;
      const employeeData = responseData?.employee || null;

      if (!token || !userData) {
        throw new Error("Invalid login response");
      }

      saveAuth(userData, employeeData, token);

      return {
        success: true,
        user: userData,
        employee: employeeData,
        token,
        data: responseData,
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Login failed";

      const normalizedError = new Error(message);
      normalizedError.response = error?.response;

      throw normalizedError;
    }
  },
  [saveAuth]
);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        clearAuth();
        return null;
      }

      const response = await api.get("/auth/me");

      const responseData = response.data?.data || response.data;

      const userData = responseData?.user;
      const employeeData = responseData?.employee || null;

      if (!userData) {
        clearAuth();
        return null;
      }

      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      if (employeeData) {
        setEmployee(employeeData);
        localStorage.setItem(
          EMPLOYEE_KEY,
          JSON.stringify(employeeData)
        );
      } else {
        setEmployee(null);
        localStorage.removeItem(EMPLOYEE_KEY);
      }

      return {
        user: userData,
        employee: employeeData,
      };
    } catch (error) {
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Logout should still clear local authentication data
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
          setLoading(false);
          return;
        }

        const storedUser = localStorage.getItem(USER_KEY);
        const storedEmployee = localStorage.getItem(EMPLOYEE_KEY);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (storedEmployee) {
          setEmployee(JSON.parse(storedEmployee));
        }

        await fetchCurrentUser();
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchCurrentUser, clearAuth]);

  const value = useMemo(
    () => ({
      user,
      employee,
      loading,
      isAuthenticated,

      login,
      logout,
      fetchCurrentUser,

      token:
        typeof window !== "undefined"
          ? localStorage.getItem(TOKEN_KEY)
          : null,
    }),
    [
      user,
      employee,
      loading,
      isAuthenticated,
      login,
      logout,
      fetchCurrentUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;