"use client";

import { useAuth } from "@/context/AuthContext";

export default function usePermission() {
  const { user, hasPermission, hasRole } = useAuth();

  const can = (permission) => {
    if (!user || !permission) {
      return false;
    }

    return hasPermission(permission);
  };

  const canAny = (permissions = []) => {
    if (!user || !Array.isArray(permissions)) {
      return false;
    }

    return permissions.some((permission) => hasPermission(permission));
  };

  const canAll = (permissions = []) => {
    if (!user || !Array.isArray(permissions)) {
      return false;
    }

    return permissions.every((permission) => hasPermission(permission));
  };

  const role = user?.role?.name ?? user?.role?.key ?? user?.role ?? null;

  return {
    user,
    role,
    can,
    canAny,
    canAll,
    hasPermission,
    hasRole,
  };
}