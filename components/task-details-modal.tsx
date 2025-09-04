"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { TaskModal } from "@/components/task-modal"
import { Edit, Trash2, Calendar, User, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface TaskDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  task: any
  actors: any[]
  onUpdate: () => void
}

export function TaskDetailsModal({ isOpen, onClose, task, actors, onUpdate }: TaskDetailsModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      onUpdate()
      onClose()
    } catch (error) {
      alert("Failed to delete task. Please try again.")
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
              <DialogTitle className="text-xl font-semibold pr-8">{task.title}</DialogTitle>
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
            {/* Status and Priority */}
            <div className="flex gap-3">
              <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              <Badge variant="outline">{task.type.replace("_", " ")}</Badge>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Talent</p>
                  <p className="font-medium">{task.actors?.name}</p>
                  {task.actors?.stage_name && <p className="text-sm text-slate-500">({task.actors.stage_name})</p>}
                </div>
              </div>

              {task.due_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-500">Due Date</p>
                    <p className="font-medium">{format(new Date(task.due_date), "PPP")}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="font-medium">{format(new Date(task.created_at), "PPP")}</p>
                </div>
              </div>

              {task.completed_at && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-slate-500">Completed</p>
                    <p className="font-medium">{format(new Date(task.completed_at), "PPP")}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            {task.description && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Notes */}
            {task.notes && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Notes</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{task.notes}</p>
              </div>
            )}

            {/* Overdue Warning */}
            {task.due_date && task.status !== "completed" && new Date(task.due_date) < new Date() && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">
                  This task is overdue by{" "}
                  {Math.ceil((Date.now() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        actors={actors}
        task={task}
      />
    </>
  )
}
