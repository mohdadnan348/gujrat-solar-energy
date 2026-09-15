import { getUserRole, hasRole } from "@/lib/auth";

/**
 * Supported application roles.
 */
export const ROLES = Object.freeze({
  ADMIN: "admin",
  MANAGER: "manager",
  HR: "hr",
  EMPLOYEE: "employee",
});

/**
 * Get the currently authenticated user's role.
 */
export const getCurrentRole = () => {
  return getUserRole();
};

/**
 * Check whether the authenticated user has a specific role.
 */
export const requireRole = (role) => {
  if (!role) {
    return false;
  }

  return hasRole(role);
};

/**
 * Check whether the authenticated user has
 * at least one role from the provided list.
 */
export const requireAnyRole = (roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }

  return roles.some((role) => hasRole(role));
};

/**
 * Check whether the authenticated user has
 * all provided roles.
 *
 * Normally a user has one role, but this helper
 * is kept for future multi-role support.
 */
export const requireAllRoles = (roles = []) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }

  return roles.every((role) => hasRole(role));
};

/**
 * Return whether a role is one of the application's
 * supported roles.
 */
export const isValidRole = (role) => {
  if (!role) {
    return false;
  }

  return Object.values(ROLES).includes(
    String(role).toLowerCase()
  );
};

/**
 * Get the dashboard route for a role.
 */
export const getRoleDashboard = (role) => {
  const normalizedRole = String(role || "").toLowerCase();

  switch (normalizedRole) {
    case ROLES.ADMIN:
      return "/admin/dashboard";

    case ROLES.MANAGER:
      return "/manager/dashboard";

    case ROLES.HR:
      return "/hr/dashboard";

    case ROLES.EMPLOYEE:
      return "/employee/dashboard";

    default:
      return "/unauthorized";
  }
};

/**
 * Get the current user's dashboard route.
 */
export const getCurrentDashboard = () => {
  return getRoleDashboard(getCurrentRole());
};

/**
 * Check whether the current user can access
 * a route based on allowed roles.
 */
export const canAccessRoute = (allowedRoles = []) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return false;
  }

  return requireAnyRole(allowedRoles);
};

const roleMiddleware = {
  ROLES,
  getCurrentRole,
  requireRole,
  requireAnyRole,
  requireAllRoles,
  isValidRole,
  getRoleDashboard,
  getCurrentDashboard,
  canAccessRoute,
};

export default roleMiddleware;