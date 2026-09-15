import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Attach authentication token to every request.
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("gse_access_token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Let the browser set the correct boundary for FormData.
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      } else {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global response handling.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("gse_access_token");
      localStorage.removeItem("gse_user");
    }

    return Promise.reject(normalizeApiError(error));
  }
);

/**
 * Normalize API errors into a predictable format.
 */
function normalizeApiError(error) {
  if (error?.response) {
    const responseData = error.response.data;

    return {
      ...error,
      message:
        responseData?.message ||
        responseData?.error ||
        error.message ||
        "Something went wrong.",
      status: error.response.status,
      data: responseData,
      isApiError: true,
    };
  }

  if (error?.request) {
    return {
      ...error,
      message:
        "Unable to connect to the server. Please check the backend server.",
      status: null,
      data: null,
      isNetworkError: true,
    };
  }

  return {
    ...error,
    message: error?.message || "An unexpected error occurred.",
    status: null,
    data: null,
  };
}

/**
 * GET request.
 */
export const get = (url, config = {}) => api.get(url, config);

/**
 * POST request.
 */
export const post = (url, data = {}, config = {}) =>
  api.post(url, data, config);

/**
 * PUT request.
 */
export const put = (url, data = {}, config = {}) =>
  api.put(url, data, config);

/**
 * PATCH request.
 */
export const patch = (url, data = {}, config = {}) =>
  api.patch(url, data, config);

/**
 * DELETE request.
 */
export const remove = (url, config = {}) => api.delete(url, config);

/**
 * Upload files using multipart/form-data.
 */
export const upload = (url, formData, config = {}) =>
  api.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
    },
  });

/**
 * Download files such as PDF documents.
 */
export const download = (url, config = {}) =>
  api.get(url, {
    ...config,
    responseType: "blob",
  });

export default api;