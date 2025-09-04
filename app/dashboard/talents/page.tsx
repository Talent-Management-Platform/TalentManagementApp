"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, User, Mail, Phone, Download } from "lucide-react"
import { TalentModal } from "@/components/talent-modal"
import { TalentDetailsModal } from "@/components/talent-details-modal"
import { PermissionGate } from "@/components/rbac/PermissionGate"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TalentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedTalent, setSelectedTalent] = useState<any>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const { data: actorsData, error, mutate } = useSWR("/api/actors", fetcher)

  const actors = actorsData?.actors || []

  // Filter actors based on search and filters
  const filteredActors = actors.filter((actor: any) => {
    const matchesSearch =
      actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actor.stage_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actor.bio?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || actor.category === categoryFilter

    return matchesSearch && matchesCategory
  })

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

  const handleTalentClick = (actor: any) => {
    setSelectedTalent(actor)
    setIsDetailsModalOpen(true)
  }

  const handleTalentUpdate = () => {
    mutate()
    setIsDetailsModalOpen(false)
    setSelectedTalent(null)
  }

  const handleTalentCreate = () => {
    mutate()
    setIsCreateModalOpen(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading talents. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Talents</h1>
          <p className="text-slate-600 mt-1">Manage your roster of actors, entrepreneurs, and influencers.</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="export_data">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
          <PermissionGate permission="manage_talents">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Talent
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
                placeholder="Search talents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="actor">Actor</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                  <SelectItem value="influencer">Influencer</SelectItem>
                  <SelectItem value="musician">Musician</SelectItem>
                  <SelectItem value="athlete">Athlete</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talents Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredActors.length > 0 ? (
          filteredActors.map((actor: any) => (
            <Card
              key={actor.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTalentClick(actor)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{actor.name}</h3>
                      {actor.stage_name && <p className="text-sm text-slate-600">"{actor.stage_name}"</p>}
                    </div>
                  </div>
                  <Badge className={getStatusColor(actor.status)}>{actor.status.replace("_", " ")}</Badge>
                </div>

                <div className="space-y-3">
                  <Badge className={getCategoryColor(actor.category)}>{actor.category}</Badge>

                  {actor.bio && <p className="text-sm text-slate-600 line-clamp-2">{actor.bio}</p>}

                  <div className="space-y-2">
                    {actor.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{actor.contact_email}</span>
                      </div>
                    )}
                    {actor.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Phone className="w-4 h-4" />
                        <span>{actor.contact_phone}</span>
                      </div>
                    )}
                  </div>

                  {actor.social_media && Object.keys(actor.social_media).length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(actor.social_media).map(([platform, handle]) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}: {handle as string}
                        </Badge>
                      ))}
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
                <h3 className="text-lg font-medium text-slate-900 mb-2">No talents found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your filters to see more talents."
                    : "Get started by adding your first talent."}
                </p>
                {!searchQuery && categoryFilter === "all" && (
                  <PermissionGate permission="manage_talents">
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Talent
                    </Button>
                  </PermissionGate>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <TalentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTalentCreate}
      />

      {selectedTalent && (
        <TalentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          talent={selectedTalent}
          onUpdate={handleTalentUpdate}
        />
      )}
    </div>
  )
}
