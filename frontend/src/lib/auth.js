const TOKEN_KEY = "gse_access_token";
const USER_KEY = "gse_user";

const isBrowser = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

/**
 * Store authentication token.
 */
export const setToken = (token) => {
  if (!isBrowser() || !token) return;

  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get authentication token.
 */
export const getToken = () => {
  if (!isBrowser()) return null;

  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove authentication token.
 */
export const removeToken = () => {
  if (!isBrowser()) return;

  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Store authenticated user.
 */
export const setUser = (user) => {
  if (!isBrowser() || !user) return;

  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get authenticated user.
 */
export const getUser = () => {
  if (!isBrowser()) return null;

  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Remove authenticated user.
 */
export const removeUser = () => {
  if (!isBrowser()) return;

  localStorage.removeItem(USER_KEY);
};

/**
 * Save complete authentication session.
 */
export const saveAuthSession = ({ token, user }) => {
  if (token) {
    setToken(token);
  }

  if (user) {
    setUser(user);
  }
};

/**
 * Clear complete authentication session.
 */
export const clearAuthSession = () => {
  removeToken();
  removeUser();
};

/**
 * Check whether a user is authenticated.
 */
export const isAuthenticated = () => {
  return Boolean(getToken());
};

/**
 * Get authorization header.
 */
export const getAuthHeader = () => {
  const token = getToken();

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Get current user's role.
 */
export const getUserRole = () => {
  const user = getUser();

  if (!user) return null;

  return (
    user?.role?.name ??
    user?.role?.key ??
    user?.role ??
    user?.userRole ??
    null
  );
};

/**
 * Check whether current user has one of the given roles.
 */
export const hasRole = (roles) => {
  const currentRole = getUserRole();

  if (!currentRole) return false;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return allowedRoles.some(
    (role) =>
      String(role).toLowerCase() ===
      String(currentRole).toLowerCase()
  );
};

/**
 * Redirect user to the appropriate dashboard.
 */
export const getDashboardPath = (role) => {
  const normalizedRole = String(role || "").toLowerCase();

  switch (normalizedRole) {
    case "admin":
      return "/admin/dashboard";

    case "manager":
      return "/manager/dashboard";

    case "hr":
      return "/hr/dashboard";

    case "employee":
      return "/employee/dashboard";

    default:
      return "/unauthorized";
  }
};

const auth = {
  setToken,
  getToken,
  removeToken,
  setUser,
  getUser,
  removeUser,
  saveAuthSession,
  clearAuthSession,
  isAuthenticated,
  getAuthHeader,
  getUserRole,
  hasRole,
  getDashboardPath,
};

export default auth;