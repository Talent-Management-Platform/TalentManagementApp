"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { TalentModal } from "@/components/talent-modal"
import { SocialAccountsSection } from "@/components/social-accounts-section"
import { Edit, Trash2, Mail, Phone, User } from "lucide-react"

interface TalentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  talent: any
  onUpdate: () => void
}

export function TalentDetailsModal({ isOpen, onClose, talent, onUpdate }: TalentDetailsModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "actor":
        return "bg-purple-100 text-purple-800"
      case "entrepreneur":
        return "bg-blue-100 text-blue-800"
      case "influencer":
        return "bg-pink-100 text-pink-800"
      case "musician":
        return "bg-green-100 text-green-800"
      case "athlete":
        return "bg-orange-100 text-orange-800"
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
      case "on_break":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this talent? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/actors/${talent.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete talent")
      }

      onUpdate()
      onClose()
    } catch (error) {
      alert("Failed to delete talent. Please try again.")
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
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">{talent.name}</DialogTitle>
                  {talent.stage_name && <p className="text-slate-600">"{talent.stage_name}"</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status and Category */}
            <div className="flex gap-3">
              <Badge className={getStatusColor(talent.status)}>{talent.status.replace("_", " ")}</Badge>
              <Badge className={getCategoryColor(talent.category)}>{talent.category}</Badge>
            </div>

            {/* Bio */}
            {talent.bio && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Bio</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{talent.bio}</p>
              </div>
            )}

            <Separator />

            {/* Contact Information */}
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Contact Information</h4>
              <div className="space-y-3">
                {talent.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{talent.contact_email}</p>
                    </div>
                  </div>
                )}
                {talent.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium">{talent.contact_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Social Accounts Section */}
            <SocialAccountsSection talentId={talent.id} />

            {/* Social Media */}
            {talent.social_media && Object.keys(talent.social_media).length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-4">Legacy Social Media</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(talent.social_media).map(([platform, handle]) => (
                    <div key={platform} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium capitalize">{platform}</span>
                      <span className="text-slate-600">{handle as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-sm text-slate-500 space-y-1">
              <p>Created: {new Date(talent.created_at).toLocaleDateString()}</p>
              <p>Updated: {new Date(talent.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <TalentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        talent={talent}
      />
    </>
  )
}
