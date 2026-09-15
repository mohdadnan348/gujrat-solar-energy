const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const authService = {
  /**
   * Login user
   */
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.message || "Login failed. Please check your credentials."
      );

      error.status = response.status;
      error.response = data;

      throw error;
    }

    return data;
  },

  /**
   * Register user
   */
  register: async (payload) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.message || "Registration failed."
      );

      error.status = response.status;
      error.response = data;

      throw error;
    }

    return data;
  },

  /**
   * Get currently authenticated user
   */
  getCurrentUser: async (token) => {
    if (!token) {
      throw new Error("Authentication token is required.");
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.message || "Unable to fetch current user."
      );

      error.status = response.status;
      error.response = data;

      throw error;
    }

    return data;
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.message || "Unable to process forgot password request."
      );

      error.status = response.status;
      error.response = data;

      throw error;
    }

    return data;
  },

  /**
   * Reset password
   */
  resetPassword: async (payload) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.message || "Unable to reset password."
      );

      error.status = response.status;
      error.response = data;

      throw error;
    }

    return data;
  },

  /**
   * Logout user
   */
  logout: async (token) => {
    if (!token) {
      return {
        success: true,
        message: "Already logged out.",
      };
    }

    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data?.message || "Logout failed."
      );

      error.status = response.status;
      error.response = data;

      throw error;
    }

    return data;
  },
};

export default authService;