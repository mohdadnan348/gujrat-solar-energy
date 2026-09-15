import api from "@/services/api";

/**
 * User Service
 *
 * Backend:
 * /auth
 *
 * User-related operations are handled through the
 * authenticated user endpoints available in the backend.
 */

/**
 * Get currently authenticated user.
 * GET /auth/me
 */
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

/**
 * Register a new user.
 * POST /auth/register
 *
 * Normally this should be used only by authorized
 * admin/HR flows when backend permissions allow it.
 */
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

/**
 * Update the locally available user profile.
 *
 * The current backend route list does not define a
 * dedicated /users/:id endpoint, so profile mutation
 * should be connected here only when such an endpoint
 * is exposed by the backend.
 */
export const updateUser = async (userId, userData) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Get a user by ID.
 *
 * Kept as a service abstraction so UI components do not
 * directly depend on Axios/API implementation.
 */
export const getUserById = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const response = await api.get(`/users/${userId}`);
  return response.data;
};

/**
 * Get users with filters/pagination.
 *
 * Example:
 * getUsers({
 *   page: 1,
 *   limit: 20,
 *   role: "EMPLOYEE",
 *   status: "ACTIVE"
 * })
 */
export const getUsers = async (params = {}) => {
  const response = await api.get("/users", {
    params,
  });

  return response.data;
};

/**
 * Deactivate a user.
 */
export const deactivateUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const response = await api.patch(`/users/${userId}/status`, {
    status: "INACTIVE",
  });

  return response.data;
};

/**
 * Activate a user.
 */
export const activateUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const response = await api.patch(`/users/${userId}/status`, {
    status: "ACTIVE",
  });

  return response.data;
};

const userService = {
  getCurrentUser,
  registerUser,
  updateUser,
  getUserById,
  getUsers,
  activateUser,
  deactivateUser,
};

export default userService;