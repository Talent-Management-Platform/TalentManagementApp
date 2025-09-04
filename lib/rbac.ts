// Role-Based Access Control utilities and types

export type Role =
  | "owner"
  | "admin"
  | "manager"
  | "editor"
  | "approver"
  | "analyst"
  | "viewer"
  | "guest"
  | "talent"
  | "freelancer"
  | "client"
  | "bot"

export type Permission =
  | "create_tasks"
  | "edit_tasks"
  | "approve_tasks"
  | "delete_tasks"
  | "view_tasks"
  | "create_pr"
  | "edit_pr"
  | "delete_pr"
  | "view_pr"
  | "view_analytics"
  | "export_data"
  | "manage_users"
  | "invite_users"
  | "manage_talents"
  | "view_talents"
  | "manage_team"
  | "view_team"

// Role hierarchy weights (higher = more permissions)
export const roleWeights: Record<Role, number> = {
  owner: 100,
  admin: 90,
  manager: 80,
  editor: 70,
  approver: 60,
  analyst: 50,
  viewer: 40,
  guest: 30,
  talent: 20,
  freelancer: 15,
  client: 10,
  bot: 5,
}

// Permission matrix - defines what each role can do
export const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    "create_tasks",
    "edit_tasks",
    "approve_tasks",
    "delete_tasks",
    "view_tasks",
    "create_pr",
    "edit_pr",
    "delete_pr",
    "view_pr",
    "view_analytics",
    "export_data",
    "manage_users",
    "invite_users",
    "manage_talents",
    "view_talents",
    "manage_team",
    "view_team",
  ],
  admin: [
    "create_tasks",
    "edit_tasks",
    "approve_tasks",
    "delete_tasks",
    "view_tasks",
    "create_pr",
    "edit_pr",
    "delete_pr",
    "view_pr",
    "view_analytics",
    "export_data",
    "manage_users",
    "invite_users",
    "manage_talents",
    "view_talents",
    "manage_team",
    "view_team",
  ],
  manager: [
    "create_tasks",
    "edit_tasks",
    "approve_tasks",
    "delete_tasks",
    "view_tasks",
    "create_pr",
    "edit_pr",
    "delete_pr",
    "view_pr",
    "view_analytics",
    "export_data",
    "invite_users",
    "manage_talents",
    "view_talents",
    "manage_team",
    "view_team",
  ],
  editor: [
    "create_tasks",
    "edit_tasks",
    "view_tasks",
    "create_pr",
    "edit_pr",
    "view_pr",
    "view_analytics",
    "view_talents",
    "view_team",
  ],
  approver: ["approve_tasks", "view_tasks", "view_pr", "view_analytics", "view_talents", "view_team"],
  analyst: ["view_tasks", "view_pr", "view_analytics", "export_data", "view_talents", "view_team"],
  viewer: ["view_tasks", "view_pr", "view_analytics", "view_talents", "view_team"],
  guest: ["view_pr", "view_talents"],
  talent: ["view_tasks", "view_pr", "view_analytics", "view_talents"],
  freelancer: [
    "create_tasks",
    "edit_tasks",
    "view_tasks",
    "create_pr",
    "edit_pr",
    "view_pr",
    "view_analytics",
    "view_talents",
  ],
  client: ["view_pr", "view_talents"],
  bot: ["view_tasks", "view_pr", "view_analytics"],
}

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

// Get the highest role from a list of roles
export function getHighestRole(roles: Role[]): Role {
  if (roles.length === 0) return "guest"

  return roles.reduce((highest, current) => {
    return roleWeights[current] > roleWeights[highest] ? current : highest
  }, roles[0])
}

// Check if user can perform action based on role hierarchy
export function canPerformAction(userRole: Role, requiredRole: Role): boolean {
  return roleWeights[userRole] >= roleWeights[requiredRole]
}

// Role display utilities
export const roleColors: Record<Role, string> = {
  owner: "bg-red-100 text-red-800",
  admin: "bg-red-100 text-red-800",
  manager: "bg-amber-100 text-amber-800",
  editor: "bg-blue-100 text-blue-800",
  approver: "bg-violet-100 text-violet-800",
  analyst: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
  guest: "bg-slate-100 text-slate-800",
  talent: "bg-emerald-100 text-emerald-800",
  freelancer: "bg-indigo-100 text-indigo-800",
  client: "bg-cyan-100 text-cyan-800",
  bot: "bg-purple-100 text-purple-800",
}

export const roleDescriptions: Record<Role, string> = {
  owner: "Full control over all talents and organization settings",
  admin: "Organization-wide full control and user management",
  manager: "Manage assigned talents, invite and edit members",
  editor: "Create and edit tasks, PR, and opportunities",
  approver: "Can approve/reject tasks and content",
  analyst: "Read-only access with export capabilities",
  viewer: "Read-only access to assigned talents",
  guest: "Limited read-only access to PR and opportunities",
  talent: "Self-service view of own profile and tasks",
  freelancer: "Time-boxed editor access, cannot invite others",
  client: "Brand/agency read-only with commenting on opportunities",
  bot: "Automated system access for integrations",
}
