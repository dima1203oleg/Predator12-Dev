"use client";

import { useAuth } from "@/hooks/useAuth";
import { signIn, signOut } from "next-auth/react";
import { Shield, LogOut, User, Lock } from "lucide-react";

export function AuthStatus() {
  const { isAuthenticated, isLoading, user, roles, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="animate-spin">⏳</div>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => signIn("keycloak")}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Lock className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
        <User className="w-4 h-4 text-green-600" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-green-900">{user?.name}</span>
          <span className="text-xs text-green-600">{user?.email}</span>
        </div>
      </div>

      {isAdmin() && (
        <div className="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-lg border border-red-200">
          <Shield className="w-3 h-3 text-red-600" />
          <span className="text-xs font-medium text-red-600">Admin</span>
        </div>
      )}

      {roles.length > 0 && (
        <div className="flex gap-1">
          {roles.map((role) => (
            <span
              key={role}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded border border-blue-200"
            >
              {role}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
