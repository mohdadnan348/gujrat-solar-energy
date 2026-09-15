"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/services/api";

/**
 * Reusable API hook
 *
 * Usage:
 * const { data, loading, error, execute } = useApi();
 *
 * await execute(() => api.get("/leads"));
 */
const useApi = (options = {}) => {
  const {
    immediate = false,
    request = null,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Execute any Axios request.
   */
  const execute = useCallback(
    async (requestFunction = request) => {
      if (!requestFunction || typeof requestFunction !== "function") {
        const apiError = new Error("API request function is required.");

        if (mountedRef.current) {
          setError(apiError);
          setLoading(false);
        }

        if (onError) {
          onError(apiError);
        }

        return {
          success: false,
          data: null,
          error: apiError,
        };
      }

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const response = await requestFunction();

        const responseData = response?.data;

        if (mountedRef.current) {
          setData(responseData);
          setError(null);
          setLoading(false);
        }

        if (onSuccess) {
          onSuccess(responseData, response);
        }

        return {
          success: true,
          data: responseData,
          response,
          error: null,
        };
      } catch (apiError) {
        const normalizedError = {
          message:
            apiError?.message ||
            "Something went wrong while processing the request.",
          status: apiError?.status || apiError?.response?.status || null,
          data: apiError?.data || apiError?.response?.data || null,
          originalError: apiError,
        };

        if (mountedRef.current) {
          setError(normalizedError);
          setLoading(false);
        }

        if (onError) {
          onError(normalizedError);
        }

        return {
          success: false,
          data: null,
          error: normalizedError,
        };
      }
    },
    [request, onSuccess, onError]
  );

  /**
   * Reset API state.
   */
  const reset = useCallback(() => {
    if (!mountedRef.current) return;

    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Automatically execute request when immediate=true.
   */
  useEffect(() => {
    if (immediate && request) {
      execute();
    }
  }, [immediate, request, execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    isSuccess: !loading && !error && data !== null,
    isError: Boolean(error),
  };
};

export default useApi;