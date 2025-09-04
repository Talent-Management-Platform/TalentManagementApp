"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Plus, User, Clock, Trash2, Edit } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface TaskAssignmentManagerProps {
  taskId: string
  onUpdate?: () => void
}

export function TaskAssignmentManager({ taskId, onUpdate }: TaskAssignmentManagerProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)

  const { data: assignmentsData, mutate: mutateAssignments } = useSWR(
    `/api/task-assignments?task_id=${taskId}`,
    fetcher,
  )
  const { data: teamMembersData } = useSWR("/api/team-members?status=active", fetcher)

  const assignments = assignmentsData?.taskAssignments || []
  const teamMembers = teamMembersData?.teamMembers || []

  const handleAssignmentSuccess = () => {
    mutateAssignments()
    setIsAssignModalOpen(false)
    setEditingAssignment(null)
    onUpdate?.()
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return

    try {
      const response = await fetch(`/api/task-assignments/${assignmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete assignment")

      mutateAssignments()
      onUpdate?.()
    } catch (error) {
      console.error("Error deleting assignment:", error)
      alert("Failed to remove assignment. Please try again.")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "lead":
        return "bg-blue-100 text-blue-800"
      case "contributor":
        return "bg-green-100 text-green-800"
      case "reviewer":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900">Team Assignments</h3>
        <Button size="sm" onClick={() => setIsAssignModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Assign Member
        </Button>
      </div>

      {assignments.length > 0 ? (
        <div className="space-y-3">
          {assignments.map((assignment: any) => (
            <Card key={assignment.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{assignment.team_members.name}</h4>
                      <p className="text-sm text-slate-600">{assignment.team_members.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {assignment.team_members.role.replace(/_/g, " ")}
                        </Badge>
                        {assignment.role_in_task && (
                          <Badge className={getRoleColor(assignment.role_in_task)} variant="secondary">
                            {assignment.role_in_task}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingAssignment(assignment)
                        setIsAssignModalOpen(true)
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteAssignment(assignment.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {(assignment.estimated_hours || assignment.actual_hours || assignment.notes) && (
                  <>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {assignment.estimated_hours && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>Est: {assignment.estimated_hours}h</span>
                        </div>
                      )}
                      {assignment.actual_hours && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>Actual: {assignment.actual_hours}h</span>
                        </div>
                      )}
                    </div>
                    {assignment.notes && <p className="text-sm text-slate-600 mt-2">{assignment.notes}</p>}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-3">No team members assigned to this task</p>
            <Button size="sm" onClick={() => setIsAssignModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Assign First Member
            </Button>
          </CardContent>
        </Card>
      )}

      <AssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false)
          setEditingAssignment(null)
        }}
        onSuccess={handleAssignmentSuccess}
        taskId={taskId}
        teamMembers={teamMembers}
        assignment={editingAssignment}
      />
    </div>
  )
}

interface AssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  taskId: string
  teamMembers: any[]
  assignment?: any
}

function AssignmentModal({ isOpen, onClose, onSuccess, taskId, teamMembers, assignment }: AssignmentModalProps) {
  const [formData, setFormData] = useState({
    team_member_id: assignment?.team_member_id || "",
    role_in_task: assignment?.role_in_task || "",
    estimated_hours: assignment?.estimated_hours || "",
    actual_hours: assignment?.actual_hours || "",
    notes: assignment?.notes || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roles = [
    { value: "lead", label: "Lead" },
    { value: "contributor", label: "Contributor" },
    { value: "reviewer", label: "Reviewer" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = assignment ? `/api/task-assignments/${assignment.id}` : "/api/task-assignments"
      const method = assignment ? "PUT" : "POST"

      const submitData = assignment
        ? {
            role_in_task: formData.role_in_task,
            estimated_hours: formData.estimated_hours ? Number.parseFloat(formData.estimated_hours) : null,
            actual_hours: formData.actual_hours ? Number.parseFloat(formData.actual_hours) : null,
            notes: formData.notes,
          }
        : {
            task_id: taskId,
            team_member_id: formData.team_member_id,
            role_in_task: formData.role_in_task,
            estimated_hours: formData.estimated_hours ? Number.parseFloat(formData.estimated_hours) : null,
            notes: formData.notes,
          }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save assignment")
      }

      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setError(null)
      if (!assignment) {
        setFormData({
          team_member_id: "",
          role_in_task: "",
          estimated_hours: "",
          actual_hours: "",
          notes: "",
        })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{assignment ? "Edit Assignment" : "Assign Team Member"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!assignment && (
            <div className="space-y-2">
              <Label htmlFor="team_member_id">Team Member *</Label>
              <Select
                value={formData.team_member_id}
                onValueChange={(value) => setFormData({ ...formData, team_member_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role_in_task">Role in Task</Label>
            <Select
              value={formData.role_in_task}
              onValueChange={(value) => setFormData({ ...formData, role_in_task: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                placeholder="0"
              />
            </div>

            {assignment && (
              <div className="space-y-2">
                <Label htmlFor="actual_hours">Actual Hours</Label>
                <Input
                  id="actual_hours"
                  type="number"
                  step="0.5"
                  value={formData.actual_hours}
                  onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? assignment
                  ? "Updating..."
                  : "Assigning..."
                : assignment
                  ? "Update Assignment"
                  : "Assign Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
