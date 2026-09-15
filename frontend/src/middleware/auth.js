import {
  getToken,
  getUser,
  isAuthenticated,
} from "@/lib/auth";

/**
 * Authentication middleware helpers.
 *
 * This file contains client-side authentication checks.
 * Backend JWT authentication remains authoritative.
 */

/**
 * Check whether the current session is authenticated.
 */
export const requireAuth = () => {
  return isAuthenticated();
};

/**
 * Return the authenticated user.
 */
export const getAuthenticatedUser = () => {
  if (!isAuthenticated()) {
    return null;
  }

  return getUser();
};

/**
 * Return the current authentication token.
 */
export const getAuthToken = () => {
  if (!isAuthenticated()) {
    return null;
  }

  return getToken();
};

/**
 * Check authentication and return a standard result.
 */
export const checkAuth = () => {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return {
      authenticated: false,
      user: null,
      token: null,
    };
  }

  return {
    authenticated: true,
    user: getUser(),
    token: getToken(),
  };
};

/**
 * Protect a client-side route.
 *
 * Returns the destination when authentication is missing.
 * Returns null when access can continue.
 */
export const getAuthRedirect = (loginPath = "/login") => {
  if (!isAuthenticated()) {
    return loginPath;
  }

  return null;
};

const authMiddleware = {
  requireAuth,
  getAuthenticatedUser,
  getAuthToken,
  checkAuth,
  getAuthRedirect,
};

export default authMiddleware;