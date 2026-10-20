import {
  ROLES,
  MODULES,
  PERMISSION_ACTIONS,
} from "@/utils/constants";

const {
  VIEW,
  CREATE,
  EDIT,
  DELETE,
  ASSIGN,
  APPROVE,
  EXPORT,
} = PERMISSION_ACTIONS;

/*
 * Default role permissions.
 *
 * Backend authorization remains authoritative.
 * These permissions are used by the frontend to control
 * navigation and action visibility.
 */

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: [VIEW],
    [MODULES.LEADS]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      ASSIGN,
      EXPORT,
    ],
    [MODULES.SOLAR_REQUIREMENTS]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      EXPORT,
    ],
    [MODULES.SYSTEM_CONFIGURATIONS]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      EXPORT,
    ],
    [MODULES.QUOTATIONS]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      APPROVE,
      EXPORT,
    ],
    [MODULES.CUSTOMERS]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      EXPORT,
    ],
    [MODULES.INVOICES]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      EXPORT,
    ],
    [MODULES.TASKS]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      ASSIGN,
      EXPORT,
    ],
    [MODULES.EMPLOYEES]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      ASSIGN,
      EXPORT,
    ],
    [MODULES.ATTENDANCE]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      EXPORT,
    ],
    [MODULES.LEAVES]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
      APPROVE,
      EXPORT,
    ],
    [MODULES.REPORTS]: [
      VIEW,
      EXPORT,
    ],
    [MODULES.NOTIFICATIONS]: [
      VIEW,
      EDIT,
      DELETE,
    ],
    [MODULES.AUDIT_LOGS]: [
      VIEW,
      EXPORT,
    ],
    [MODULES.SETTINGS]: [
      VIEW,
      CREATE,
      EDIT,
      DELETE,
    ],
  },

  [ROLES.EMPLOYEE]: {
    [MODULES.DASHBOARD]: [VIEW],
    [MODULES.LEADS]: [
      VIEW,
      CREATE,
      EDIT,
    ],
    [MODULES.SOLAR_REQUIREMENTS]: [
      VIEW,
      CREATE,
      EDIT,
    ],
    [MODULES.SYSTEM_CONFIGURATIONS]: [
      VIEW,
      EDIT,
    ],
    [MODULES.QUOTATIONS]: [
      VIEW,
      CREATE,
      EDIT,
    ],
    [MODULES.CUSTOMERS]: [
      VIEW,
      EDIT,
    ],
    [MODULES.INVOICES]: [
      VIEW,
    ],
    [MODULES.TASKS]: [
      VIEW,
      EDIT,
    ],
    [MODULES.EMPLOYEES]: [],
    [MODULES.ATTENDANCE]: [
      VIEW,
      CREATE,
      EDIT,
    ],
    [MODULES.LEAVES]: [
      VIEW,
      CREATE,
      EDIT,
    ],
    [MODULES.REPORTS]: [
      VIEW,
    ],
    [MODULES.NOTIFICATIONS]: [
      VIEW,
      EDIT,
    ],
    [MODULES.AUDIT_LOGS]: [],
    [MODULES.SETTINGS]: [],
  },
};

const normalizeRole = (role) => {
  if (!role) return null;

  return String(role)
    .trim()
    .toUpperCase();
};

const normalizePermission = (permission) => {
  if (!permission) return null;

  return String(permission)
    .trim()
    .toLowerCase();
};

const normalizeModule = (module) => {
  if (!module) return null;

  return String(module)
    .trim()
    .toLowerCase();
};

export const getRolePermissions = (role) => {
  const normalizedRole = normalizeRole(role);

  return ROLE_PERMISSIONS[normalizedRole] || {};
};

export const getModulePermissions = (role, module) => {
  const permissions = getRolePermissions(role);
  const normalizedModule = normalizeModule(module);

  return permissions[normalizedModule] || [];
};

export const hasPermission = (role, module, permission) => {
  const normalizedPermission = normalizePermission(permission);

  if (!normalizedPermission) {
    return false;
  }

  const modulePermissions = getModulePermissions(
    role,
    module
  );

  return modulePermissions.includes(normalizedPermission);
};

export const hasAnyPermission = (
  role,
  module,
  permissions = []
) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) =>
    hasPermission(role, module, permission)
  );
};

export const hasAllPermissions = (
  role,
  module,
  permissions = []
) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.every((permission) =>
    hasPermission(role, module, permission)
  );
};

export const canView = (role, module) =>
  hasPermission(role, module, VIEW);

export const canCreate = (role, module) =>
  hasPermission(role, module, CREATE);

export const canEdit = (role, module) =>
  hasPermission(role, module, EDIT);

export const canDelete = (role, module) =>
  hasPermission(role, module, DELETE);

export const canAssign = (role, module) =>
  hasPermission(role, module, ASSIGN);

export const canApprove = (role, module) =>
  hasPermission(role, module, APPROVE);

export const canExport = (role, module) =>
  hasPermission(role, module, EXPORT);

export const isAdmin = (role) =>
  normalizeRole(role) === ROLES.ADMIN;

export const isManager = (_role) => false;

export const isHR = (_role) => false;

export const isEmployee = (role) =>
  normalizeRole(role) === ROLES.EMPLOYEE;

export const isAdminOrManager = (role) => isAdmin(role);

export const isAdminOrHR = (role) => isAdmin(role);

export const canAccessModule = (role, module) =>
  canView(role, module);

export const getAccessibleModules = (role) => {
  const permissions = getRolePermissions(role);

  return Object.keys(permissions).filter(
    (module) => permissions[module]?.length > 0
  );
};

export const filterByPermission = (
  role,
  module,
  items = [],
  permission = VIEW
) => {
  if (!hasPermission(role, module, permission)) {
    return [];
  }

  return items;
};

export const ROLE_PERMISSIONS_MAP = ROLE_PERMISSIONS;

export default ROLE_PERMISSIONS;