import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authStore } from '../../store/auth';
import { Role } from '../../types';

interface RoleGuardProps {
  children: ReactNode;
  /** Allowed roles — if omitted, any authenticated user is allowed */
  allowedRoles?: Role[];
  /** Where to redirect if access is denied (defaults to '/') */
  redirectTo?: string;
}

/**
 * Wraps a route and redirects the user if they don't have an allowed role.
 * Also redirects to /login if unauthenticated.
 */
export function RoleGuard({ children, allowedRoles, redirectTo = '/' }: RoleGuardProps) {
  const auth = authStore.get();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

/**
 * Returns true if the current logged-in user has at least one of the given roles.
 * Use this for conditional rendering of buttons / sections within a page.
 */
export function useHasRole(...roles: Role[]): boolean {
  const auth = authStore.get();
  if (!auth) return false;
  return roles.includes(auth.role);
}
