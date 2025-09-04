"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, User, Mail, Phone, Calendar } from "lucide-react"
import { TeamMemberModal } from "@/components/team-member-modal"
import { TeamMemberDetailsModal } from "@/components/team-member-details-modal"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TeamPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data: teamMembersData, error, mutate } = useSWR("/api/team-members", fetcher)

  const teamMembers = teamMembersData?.teamMembers || []

  // Filter team members based on search and filters
  const filteredTeamMembers = teamMembers.filter((member: any) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesStatus = statusFilter === "all" || member.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

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

  const handleTeamMemberClick = (member: any) => {
    setSelectedTeamMember(member)
    setIsDetailsModalOpen(true)
  }

  const handleTeamMemberUpdate = () => {
    mutate()
    setIsDetailsModalOpen(false)
    setSelectedTeamMember(null)
  }

  const handleTeamMemberCreate = () => {
    mutate()
    setIsCreateModalOpen(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading team members. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team</h1>
          <p className="text-slate-600 mt-1">Manage your internal team members and their roles.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="content_creator">Content Creator</SelectItem>
                  <SelectItem value="social_media_manager">Social Media Manager</SelectItem>
                  <SelectItem value="pr_specialist">PR Specialist</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeamMembers.length > 0 ? (
          filteredTeamMembers.map((member: any) => (
            <Card
              key={member.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTeamMemberClick(member)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{member.name}</h3>
                      {member.department && <p className="text-sm text-slate-600">{member.department}</p>}
                    </div>
                  </div>
                  <Badge className={getStatusColor(member.status)}>{member.status.replace("_", " ")}</Badge>
                </div>

                <div className="space-y-3">
                  <Badge className={getRoleColor(member.role)}>{formatRole(member.role)}</Badge>

                  {member.bio && <p className="text-sm text-slate-600 line-clamp-2">{member.bio}</p>}

                  <div className="space-y-2">
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.hire_date && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(member.hire_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {member.skills.slice(0, 3).map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No team members found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters to see more team members."
                    : "Get started by adding your first team member."}
                </p>
                {!searchQuery && roleFilter === "all" && statusFilter === "all" && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <TeamMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTeamMemberCreate}
      />

      {selectedTeamMember && (
        <TeamMemberDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          teamMember={selectedTeamMember}
          onUpdate={handleTeamMemberUpdate}
        />
      )}
    </div>
  )
}
