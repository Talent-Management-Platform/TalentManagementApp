"use client"

import type { ReactNode } from "react"
import { useRoles } from "@/hooks/useRoles"
import type { Permission, Role } from "@/lib/rbac"

interface ConditionalRenderProps {
  children: (props: {
    effectiveRole: Role
    hasPermission: (permission: Permission) => boolean
    hasAnyPermission: (permissions: Permission[]) => boolean
    canManage: (role: Role) => boolean
  }) => ReactNode
  talentId?: string | null
}

export function ConditionalRender({ children, talentId }: ConditionalRenderProps) {
  const { effectiveRole, hasPermission, hasAnyPermission, canManage, isLoading } = useRoles({ talentId })

  if (isLoading) {
    return null
  }

  return <>{children({ effectiveRole, hasPermission, hasAnyPermission, canManage })}</>
}
