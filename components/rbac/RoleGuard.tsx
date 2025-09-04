"use client"

import type { ReactNode } from "react"
import { useRoles } from "@/hooks/useRoles"
import type { Role } from "@/lib/rbac"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: Role[]
  talentId?: string | null
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, talentId, fallback = null }: RoleGuardProps) {
  const { effectiveRole, isLoading } = useRoles({ talentId })

  if (isLoading) {
    return <>{fallback}</>
  }

  if (!allowedRoles.includes(effectiveRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
