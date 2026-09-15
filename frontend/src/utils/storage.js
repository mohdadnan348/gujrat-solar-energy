/**
 * Local storage utility functions
 * GUJRAT SOLAR ENERGY Frontend
 *
 * Safe for SSR environments such as Next.js.
 */

const isBrowser = () => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

/**
 * Storage keys used by the application.
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "gse_access_token",
  REFRESH_TOKEN: "gse_refresh_token",
  USER: "gse_user",
  THEME: "gse_theme",
  SIDEBAR_COLLAPSED: "gse_sidebar_collapsed",
  LANGUAGE: "gse_language",
  REMEMBER_ME: "gse_remember_me",
  LAST_ROUTE: "gse_last_route",
};

/**
 * Get a value from localStorage.
 *
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export const getItem = (key, defaultValue = null) => {
  if (!isBrowser()) {
    return defaultValue;
  }

  try {
    const value = window.localStorage.getItem(key);

    if (value === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Failed to read storage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Set a value in localStorage.
 *
 * Objects and arrays are automatically serialized.
 *
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
export const setItem = (key, value) => {
  if (!isBrowser()) {
    return false;
  }

  try {
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);

    window.localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Failed to save storage key "${key}":`, error);
    return false;
  }
};

/**
 * Remove a value from localStorage.
 *
 * @param {string} key
 * @returns {boolean}
 */
export const removeItem = (key) => {
  if (!isBrowser()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove storage key "${key}":`, error);
    return false;
  }
};

/**
 * Check whether a key exists.
 *
 * @param {string} key
 * @returns {boolean}
 */
export const hasItem = (key) => {
  if (!isBrowser()) {
    return false;
  }

  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
};

/**
 * Clear all localStorage data.
 *
 * @returns {boolean}
 */
export const clear = () => {
  if (!isBrowser()) {
    return false;
  }

  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
    return false;
  }
};

/**
 * Clear only application-specific storage.
 *
 * This avoids removing unrelated websites' localStorage entries.
 *
 * @returns {boolean}
 */
export const clearAppStorage = () => {
  if (!isBrowser()) {
    return false;
  }

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error("Failed to clear application storage:", error);
    return false;
  }
};

/**
 * Get access token.
 *
 * @returns {string|null}
 */
export const getAccessToken = () => {
  return getItem(STORAGE_KEYS.ACCESS_TOKEN, null);
};

/**
 * Save access token.
 *
 * @param {string} token
 * @returns {boolean}
 */
export const setAccessToken = (token) => {
  if (!token) {
    return removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  return setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
};

/**
 * Remove access token.
 *
 * @returns {boolean}
 */
export const removeAccessToken = () => {
  return removeItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Get refresh token.
 *
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  return getItem(STORAGE_KEYS.REFRESH_TOKEN, null);
};

/**
 * Save refresh token.
 *
 * @param {string} token
 * @returns {boolean}
 */
export const setRefreshToken = (token) => {
  if (!token) {
    return removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  return setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

/**
 * Remove refresh token.
 *
 * @returns {boolean}
 */
export const removeRefreshToken = () => {
  return removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Get stored authenticated user.
 *
 * @returns {object|null}
 */
export const getStoredUser = () => {
  return getItem(STORAGE_KEYS.USER, null);
};

/**
 * Save authenticated user.
 *
 * @param {object} user
 * @returns {boolean}
 */
export const setStoredUser = (user) => {
  if (!user) {
    return removeItem(STORAGE_KEYS.USER);
  }

  return setItem(STORAGE_KEYS.USER, user);
};

/**
 * Remove stored user.
 *
 * @returns {boolean}
 */
export const removeStoredUser = () => {
  return removeItem(STORAGE_KEYS.USER);
};

/**
 * Save login session.
 *
 * @param {object} session
 * @param {string} session.accessToken
 * @param {string} [session.refreshToken]
 * @param {object} [session.user]
 * @returns {boolean}
 */
export const saveSession = ({
  accessToken,
  refreshToken,
  user,
} = {}) => {
  let success = true;

  if (accessToken) {
    success = setAccessToken(accessToken) && success;
  }

  if (refreshToken) {
    success = setRefreshToken(refreshToken) && success;
  }

  if (user) {
    success = setStoredUser(user) && success;
  }

  return success;
};

/**
 * Clear authentication session.
 *
 * @returns {boolean}
 */
export const clearSession = () => {
  const results = [
    removeAccessToken(),
    removeRefreshToken(),
    removeStoredUser(),
  ];

  return results.every(Boolean);
};

/**
 * Get theme preference.
 *
 * @returns {string|null}
 */
export const getTheme = () => {
  return getItem(STORAGE_KEYS.THEME, null);
};

/**
 * Save theme preference.
 *
 * @param {string} theme
 * @returns {boolean}
 */
export const setTheme = (theme) => {
  return setItem(STORAGE_KEYS.THEME, theme);
};

/**
 * Get sidebar collapsed state.
 *
 * @returns {boolean}
 */
export const getSidebarCollapsed = () => {
  return Boolean(getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, false));
};

/**
 * Save sidebar collapsed state.
 *
 * @param {boolean} collapsed
 * @returns {boolean}
 */
export const setSidebarCollapsed = (collapsed) => {
  return setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, Boolean(collapsed));
};

/**
 * Get language preference.
 *
 * @returns {string|null}
 */
export const getLanguage = () => {
  return getItem(STORAGE_KEYS.LANGUAGE, null);
};

/**
 * Save language preference.
 *
 * @param {string} language
 * @returns {boolean}
 */
export const setLanguage = (language) => {
  return setItem(STORAGE_KEYS.LANGUAGE, language);
};

/**
 * Get remember-me preference.
 *
 * @returns {boolean}
 */
export const getRememberMe = () => {
  return Boolean(getItem(STORAGE_KEYS.REMEMBER_ME, false));
};

/**
 * Save remember-me preference.
 *
 * @param {boolean} value
 * @returns {boolean}
 */
export const setRememberMe = (value) => {
  return setItem(STORAGE_KEYS.REMEMBER_ME, Boolean(value));
};

/**
 * Save the last visited application route.
 *
 * @param {string} route
 * @returns {boolean}
 */
export const setLastRoute = (route) => {
  if (!route) {
    return removeItem(STORAGE_KEYS.LAST_ROUTE);
  }

  return setItem(STORAGE_KEYS.LAST_ROUTE, route);
};

/**
 * Get the last visited application route.
 *
 * @returns {string|null}
 */
export const getLastRoute = () => {
  return getItem(STORAGE_KEYS.LAST_ROUTE, null);
};

/**
 * Remove the saved last route.
 *
 * @returns {boolean}
 */
export const removeLastRoute = () => {
  return removeItem(STORAGE_KEYS.LAST_ROUTE);
};

export default {
  getItem,
  setItem,
  removeItem,
  hasItem,
  clear,
  clearAppStorage,

  getAccessToken,
  setAccessToken,
  removeAccessToken,

  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,

  getStoredUser,
  setStoredUser,
  removeStoredUser,

  saveSession,
  clearSession,

  getTheme,
  setTheme,

  getSidebarCollapsed,
  setSidebarCollapsed,

  getLanguage,
  setLanguage,

  getRememberMe,
  setRememberMe,

  setLastRoute,
  getLastRoute,
  removeLastRoute,

  STORAGE_KEYS,
};