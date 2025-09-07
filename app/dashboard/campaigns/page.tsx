"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, Target, Users, TrendingUp, Download, Briefcase } from "lucide-react"
import { CampaignModal } from "@/components/campaign-modal"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CampaignsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [ownerKindFilter, setOwnerKindFilter] = useState("all")

  const { data: campaignsData, error, mutate } = useSWR("/api/campaigns", fetcher)
  const { data: talentsData } = useSWR("/api/actors", fetcher)
  const { data: brandsData } = useSWR("/api/brands", fetcher)

  const campaigns = campaignsData?.campaigns || []
  const talents = talentsData?.actors || []
  const brands = brandsData?.brands || []

  // Create owner lookup maps
  const talentMap = talents.reduce((acc: any, talent: any) => {
    acc[talent.id] = talent
    return acc
  }, {})

  const brandMap = brands.reduce((acc: any, brand: any) => {
    acc[brand.id] = brand
    return acc
  }, {})

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign: any) => {
    const owner = campaign.owner_kind === "talent" ? talentMap[campaign.owner_id] : brandMap[campaign.owner_id]
    const ownerName = owner?.name || "Unknown"

    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.vision?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ownerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesPriority = priorityFilter === "all" || campaign.priority === priorityFilter
    const matchesOwnerKind = ownerKindFilter === "all" || campaign.owner_kind === ownerKindFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesOwnerKind
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
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

  const getOwnerKindColor = (ownerKind: string) => {
    switch (ownerKind) {
      case "talent":
        return "bg-purple-100 text-purple-800"
      case "brand":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCampaignCreate = () => {
    mutate()
    setIsCreateModalOpen(false)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading campaigns. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-600 mt-1">Manage promotional campaigns for your talents and brand partnerships.</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate permission="export_data">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
          <PermissionGate permission="manage_campaigns">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
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
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={ownerKindFilter} onValueChange={setOwnerKindFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="talent">Talent</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
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
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign: any) => {
            const owner = campaign.owner_kind === "talent" ? talentMap[campaign.owner_id] : brandMap[campaign.owner_id]
            const ownerName = owner?.name || "Unknown"

            return (
              <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{campaign.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{ownerName}</p>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status.replace("_", " ")}</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Badge className={getOwnerKindColor(campaign.owner_kind)}>{campaign.owner_kind}</Badge>
                        <Badge className={getPriorityColor(campaign.priority)}>{campaign.priority}</Badge>
                      </div>

                      {campaign.vision && <p className="text-sm text-slate-600 line-clamp-3">{campaign.vision}</p>}

                      <div className="space-y-2 text-sm text-slate-500">
                        {campaign.start_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(campaign.start_date).toLocaleDateString()}
                              {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>0% Complete</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>0 Members</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{campaign.budget_currency || "USD"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        ) : (
          <div className="col-span-full">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns found</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || ownerKindFilter !== "all"
                    ? "Try adjusting your filters to see more campaigns."
                    : "Get started by creating your first campaign."}
                </p>
                {!searchQuery && statusFilter === "all" && priorityFilter === "all" && ownerKindFilter === "all" && (
                  <PermissionGate permission="manage_campaigns">
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </PermissionGate>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal */}
      <CampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCampaignCreate}
        talents={talents}
        brands={brands}
      />
    </div>
  )
}
