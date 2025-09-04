"use client"

import type { ReactNode } from "react"
import { useRoles } from "@/hooks/useRoles"
import type { Permission, Role } from "@/lib/rbac"

interface PermissionGateProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  role?: Role
  talentId?: string | null
  fallback?: ReactNode
  requireAll?: boolean // If true, requires ALL permissions; if false, requires ANY
}

export function PermissionGate({
  children,
  permission,
  permissions,
  role,
  talentId,
  fallback = null,
  requireAll = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, canManage, isLoading } = useRoles({ talentId })

  if (isLoading) {
    return <>{fallback}</>
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions) {
    const hasRequiredPermissions = requireAll
      ? permissions.every((p) => hasPermission(p))
      : hasAnyPermission(permissions)

    if (!hasRequiredPermissions) {
      return <>{fallback}</>
    }
  }

  // Check role hierarchy
  if (role && !canManage(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
