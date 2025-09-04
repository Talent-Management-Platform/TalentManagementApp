"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, User, CheckCircle2, Clock, AlertCircle, Users, Download } from "lucide-react"
import { TaskModal } from "@/components/task-modal"
import { TaskDetailsModal } from "@/components/task-details-modal"
import { PermissionGate } from "@/components/rbac/PermissionGate"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const { data: tasksData, error, mutate } = useSWR("/api/tasks", fetcher)
  const { data: actorsData } = useSWR("/api/actors", fetcher)
  const { data: assignmentsData } = useSWR("/api/task-assignments", fetcher)

  const tasks = tasksData?.tasks || []
  const actors = actorsData?.actors || []
  const assignments = assignmentsData?.taskAssignments || []

  const taskAssignmentsMap = assignments.reduce((acc: any, assignment: any) => {
    if (!acc[assignment.task_id]) {
      acc[assignment.task_id] = []
    }
    acc[assignment.task_id].push(assignment)
    return acc
  }, {})

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.actors?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const handleTaskClick = (task: any) => {
    setSelectedTask(task)
    setIsDetailsModalOpen(true)
  }

  const handleTaskUpdate = () => {
    mutate()
    setIsDetailsModalOpen(false)
    setSelectedTask(null)
  }

  const handleTaskCreate = () => {
    mutate()
    setIsCreateModalOpen(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading tasks. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-600 mt-1">Manage promotional activities and assignments for your talents.</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="export_data">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
          <PermissionGate permissions={["create_tasks", "edit_tasks"]} requireAll={false}>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task: any) => {
            const taskAssignments = taskAssignmentsMap[task.id] || []

            return (
              <Card
                key={task.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-semibold text-slate-900">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                      </div>

                      {task.description && <p className="text-slate-600 mb-3 line-clamp-2">{task.description}</p>}

                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{task.actors?.name || task.actors?.stage_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : "No due date"}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {task.type.replace("_", " ")}
                        </Badge>
                        {taskAssignments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {taskAssignments.length} team member{taskAssignments.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>

                      {taskAssignments.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-slate-500">Assigned to:</span>
                          <div className="flex -space-x-2">
                            {taskAssignments.slice(0, 3).map((assignment: any, index: number) => (
                              <div
                                key={assignment.id}
                                className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 border-2 border-white"
                                title={assignment.team_members.name}
                              >
                                {assignment.team_members.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {taskAssignments.length > 3 && (
                              <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 border-2 border-white">
                                +{taskAssignments.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
              <p className="text-slate-600 mb-6">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters to see more tasks."
                  : "Get started by creating your first task."}
              </p>
              {!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
                <PermissionGate permissions={["create_tasks", "edit_tasks"]} requireAll={false}>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </PermissionGate>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTaskCreate}
        actors={actors}
      />

      {selectedTask && (
        <TaskDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          task={selectedTask}
          actors={actors}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  )
}
