"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Calendar, DollarSign, Edit, Trash2 } from "lucide-react"
import { TeamMemberModal } from "./team-member-modal"

interface TeamMemberDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  teamMember: any
  onUpdate: () => void
}

export function TeamMemberDetailsModal({ isOpen, onClose, teamMember, onUpdate }: TeamMemberDetailsModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "project_manager":
        return "bg-blue-100 text-blue-800"
      case "content_creator":
        return "bg-purple-100 text-purple-800"
      case "social_media_manager":
        return "bg-pink-100 text-pink-800"
      case "pr_specialist":
        return "bg-green-100 text-green-800"
      case "designer":
        return "bg-orange-100 text-orange-800"
      case "developer":
        return "bg-indigo-100 text-indigo-800"
      case "assistant":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "on_leave":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatRole = (role: string) => {
    return role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this team member? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/team-members/${teamMember.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete team member")
      }

      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error deleting team member:", error)
      alert("Failed to delete team member. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    onUpdate()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Team Member Details</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-slate-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900">{teamMember.name}</h2>
                {teamMember.department && <p className="text-slate-600">{teamMember.department}</p>}
                <div className="flex gap-2 mt-2">
                  <Badge className={getRoleColor(teamMember.role)}>{formatRole(teamMember.role)}</Badge>
                  <Badge className={getStatusColor(teamMember.status)}>{teamMember.status.replace("_", " ")}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">Contact Information</h3>
              <div className="grid grid-cols-1 gap-3">
                {teamMember.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{teamMember.email}</span>
                  </div>
                )}
                {teamMember.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">{teamMember.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">Employment Details</h3>
              <div className="grid grid-cols-1 gap-3">
                {teamMember.hire_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">
                      Hired on {new Date(teamMember.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {teamMember.hourly_rate && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700">${teamMember.hourly_rate}/hour</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {teamMember.bio && (
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900">Bio</h3>
                <p className="text-slate-700 leading-relaxed">{teamMember.bio}</p>
              </div>
            )}

            {/* Skills */}
            {teamMember.skills && teamMember.skills.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900">Skills</h3>
                <div className="flex gap-2 flex-wrap">
                  {teamMember.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="space-y-2 text-sm text-slate-500">
              <p>Created: {new Date(teamMember.created_at).toLocaleString()}</p>
              {teamMember.updated_at !== teamMember.created_at && (
                <p>Last updated: {new Date(teamMember.updated_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <TeamMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        teamMember={teamMember}
      />
    </>
  )
}
