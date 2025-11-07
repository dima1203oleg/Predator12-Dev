"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const hasRole = (role: string): boolean => {
    return session?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every((role) => hasRole(role));
  };

  const inGroup = (group: string): boolean => {
    return session?.groups?.includes(group) || false;
  };

  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  const isAnalyst = (): boolean => {
    return hasAnyRole(["admin", "analyst"]);
  };

  const isEngineer = (): boolean => {
    return hasAnyRole(["admin", "data-engineer", "ml-engineer"]);
  };

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user,
    roles: session?.roles || [],
    groups: session?.groups || [],
    hasRole,
    hasAnyRole,
    hasAllRoles,
    inGroup,
    isAdmin,
    isAnalyst,
    isEngineer,
  };
}
