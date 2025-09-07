"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface User {
  id: string
  email: string
  name: string
  created_at: string
  membership_count: number
  highest_role: string
}

interface UserDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onUserUpdated: () => void
}

interface Membership {
  id: string
  role: string
  talent_id: string | null
  talent_name?: string
  talent_type?: string
  created_at: string
}

interface Talent {
  id: string
  name: string
  type: string
}

export function UserDetailDrawer({ open, onOpenChange, user, onUserUpdated }: UserDetailDrawerProps) {
  const [newRole, setNewRole] = useState<string>("admin") // Updated default value
  const [newTalentId, setNewTalentId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: memberships = [], mutate: mutateMemberships } = useSWR<Membership[]>(
    user ? `/api/memberships?user_id=${user.id}` : null,
    fetcher,
  )

  const { data: talents = [] } = useSWR<Talent[]>("/api/talents", fetcher)

  const handleAddMembership = async () => {
    if (!newRole) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          role: newRole,
          talent_id: newTalentId === "org-wide" ? null : newTalentId || null,
        }),
      })

      if (response.ok) {
        toast.success("Membership added successfully")
        setNewRole("")
        setNewTalentId("")
        mutateMemberships()
        onUserUpdated()
      } else {
        const error = await response.text()
        toast.error(error || "Failed to add membership")
      }
    } catch (error) {
      toast.error("Failed to add membership")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMembership = async (membershipId: string) => {
    try {
      const response = await fetch(`/api/memberships/${membershipId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Membership removed successfully")
        mutateMemberships()
        onUserUpdated()
      } else {
        const error = await response.text()
        toast.error(error || "Failed to remove membership")
      }
    } catch (error) {
      toast.error("Failed to remove membership")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "assistant":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>Manage user permissions and talent access</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">{user.name || "Unnamed User"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Joined</Label>
                <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Highest Role</Label>
                <Badge className={getRoleColor(user.highest_role)}>{user.highest_role || "guest"}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Current Memberships */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Memberships</CardTitle>
              <CardDescription>User's current roles and talent access</CardDescription>
            </CardHeader>
            <CardContent>
              {memberships.length === 0 ? (
                <p className="text-sm text-muted-foreground">No memberships found</p>
              ) : (
                <div className="space-y-2">
                  {memberships.map((membership) => (
                    <div key={membership.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleColor(membership.role)}>{membership.role}</Badge>
                          {membership.talent_name && (
                            <span className="text-sm text-muted-foreground">
                              for {membership.talent_name} ({membership.talent_type})
                            </span>
                          )}
                          {!membership.talent_name && (
                            <span className="text-sm text-muted-foreground">Organization-wide</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(membership.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleRemoveMembership(membership.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Membership */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Membership</CardTitle>
              <CardDescription>Grant additional roles or talent access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-role">Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="manager">Manager - Manage talents and tasks</SelectItem>
                    <SelectItem value="assistant">Assistant - View and basic editing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-talent">Talent (Optional)</Label>
                <Select value={newTalentId} onValueChange={setNewTalentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Organization-wide access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org-wide">Organization-wide</SelectItem>
                    {talents.map((talent) => (
                      <SelectItem key={talent.id} value={talent.id}>
                        {talent.name} ({talent.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddMembership} disabled={!newRole || isSubmitting} className="w-full">
                {isSubmitting ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Membership
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
