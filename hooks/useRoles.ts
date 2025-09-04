"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { type Role, type Permission, hasPermission, hasAnyPermission, roleWeights } from "@/lib/rbac"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface UseRolesOptions {
  talentId?: string | null
  userId?: string | null
}

interface UseRolesReturn {
  effectiveRole: Role
  memberships: any[]
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  canManage: (requiredRole: Role) => boolean
  isLoading: boolean
  error: any
}

export function useRoles({ talentId, userId }: UseRolesOptions = {}): UseRolesReturn {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log("[v0] Current user for roles:", user?.id)
      setCurrentUserId(user?.id || null)
      setAuthLoading(false)
    }
    getUser()
  }, [])

  const effectiveUserId = userId || currentUserId

  const { data, error, isLoading } = useSWR(
    effectiveUserId ? `/api/me/effective-roles?talentId=${talentId || ""}&userId=${effectiveUserId}` : null,
    fetcher,
  )

  const effectiveRole: Role = data?.effectiveRole || "guest"
  const memberships = data?.memberships || []

  console.log("[v0] useRoles - User ID:", effectiveUserId, "Role:", effectiveRole, "Loading:", isLoading || authLoading)

  return {
    effectiveRole,
    memberships,
    hasPermission: (permission: Permission) => hasPermission(effectiveRole, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(effectiveRole, permissions),
    canManage: (requiredRole: Role) => {
      const userWeight = roleWeights[effectiveRole] || 0
      const requiredWeight = roleWeights[requiredRole] || 0
      return userWeight >= requiredWeight
    },
    isLoading: isLoading || authLoading,
    error,
  }
}

// Hook for checking permissions without fetching (when you already have the role)
export function usePermissions(role: Role) {
  return {
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canManage: (requiredRole: Role) => {
      const userWeight = roleWeights[role] || 0
      const requiredWeight = roleWeights[requiredRole] || 0
      return userWeight >= requiredWeight
    },
  }
}
