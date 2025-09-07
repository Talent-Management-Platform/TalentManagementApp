"use client"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Edit, Calendar, Target, Users, DollarSign, Plus, Download } from "lucide-react"
import Link from "next/link"
import { PermissionGate } from "@/components/rbac/PermissionGate"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string

  const { data: campaignData, error } = useSWR(`/api/campaigns/${campaignId}`, fetcher)
  const { data: tasksData } = useSWR(`/api/campaigns/${campaignId}/tasks`, fetcher)
  const { data: membersData } = useSWR(`/api/campaigns/${campaignId}/members`, fetcher)
  const { data: budgetData } = useSWR(`/api/campaigns/${campaignId}/budget`, fetcher)
  const { data: updatesData } = useSWR(`/api/campaigns/${campaignId}/updates`, fetcher)
  const { data: reportsData } = useSWR(`/api/campaigns/${campaignId}/reports`, fetcher)

  const campaign = campaignData?.campaign
  const tasks = tasksData?.tasks || []
  const members = membersData?.members || []
  const budgetItems = budgetData?.budgetItems || []
  const budgetTotal = budgetData?.total || 0
  const updates = updatesData?.updates || []
  const reports = reportsData?.reports || []

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading campaign. Please try again.</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Loading campaign...</p>
      </div>
    )
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">{campaign.title}</h1>
              <Badge className={getStatusColor(campaign.status)}>{campaign.status.replace("_", " ")}</Badge>
              <Badge className={getPriorityColor(campaign.priority)}>{campaign.priority}</Badge>
            </div>
            {campaign.vision && <p className="text-slate-600">{campaign.vision}</p>}
          </div>
        </div>
        <PermissionGate permission="manage_campaigns">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Campaign
          </Button>
        </PermissionGate>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Progress</p>
                <p className="text-2xl font-bold text-slate-900">{campaign.progress_pct || 0}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <Progress value={campaign.progress_pct || 0} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tasks</p>
                <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Budget</p>
                <p className="text-2xl font-bold text-slate-900">
                  {campaign.budget_currency} {budgetTotal.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Team</p>
                <p className="text-2xl font-bold text-slate-900">{members.length}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaign.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {campaign.end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">End: {new Date(campaign.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {updates.length > 0 ? (
                  <div className="space-y-3">
                    {updates.slice(0, 3).map((update: any) => (
                      <div key={update.id} className="text-sm">
                        <p className="font-medium">{update.title}</p>
                        <p className="text-slate-600 text-xs">{new Date(update.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategy">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.strategy ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{campaign.strategy}</pre>
                </div>
              ) : (
                <p className="text-slate-500">No strategy defined yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign Tasks</CardTitle>
              <PermissionGate permission="manage_campaigns">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-slate-600">{task.description}</p>
                      </div>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No tasks created yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <PermissionGate permission="manage_campaigns">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              {members.length > 0 ? (
                <div className="space-y-3">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.user_name}</p>
                        <p className="text-sm text-slate-600">{member.role}</p>
                      </div>
                      <div className="text-sm text-slate-500">{member.email}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No team members added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Budget Breakdown</CardTitle>
              <PermissionGate permission="manage_campaigns">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              {budgetItems.length > 0 ? (
                <div className="space-y-3">
                  {budgetItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-slate-600">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {campaign.budget_currency} {Number(item.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        {campaign.budget_currency} {budgetTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No budget items added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign Updates</CardTitle>
              <PermissionGate permission="manage_campaigns">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Update
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              {updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update: any) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{update.title}</h4>
                        <span className="text-xs text-slate-500">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{update.body}</p>
                      {update.created_by && <p className="text-xs text-slate-500 mt-1">by {update.created_by}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No updates posted yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign Reports</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generate 24h
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Generate 7d
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{report.window} Report</p>
                        <p className="text-sm text-slate-600">
                          Generated {new Date(report.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No reports generated yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
