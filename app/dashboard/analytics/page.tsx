"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PermissionGate } from "@/components/rbac/PermissionGate"
import {
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Calendar,
  Target,
  Download,
  MessageSquare,
  Heart,
  Eye,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AnalyticsPage() {
  const [selectedActor, setSelectedActor] = useState("all")
  const [timeRange, setTimeRange] = useState("30")

  const { data: actorsData } = useSWR("/api/actors", fetcher)
  const { data: analyticsData } = useSWR(
    `/api/analytics?${selectedActor !== "all" ? `actor_id=${selectedActor}&` : ""}start_date=${new Date(Date.now() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`,
    fetcher,
  )
  const { data: tasksData } = useSWR("/api/tasks", fetcher)
  const { data: prData } = useSWR("/api/pr-items", fetcher)
  const { data: socialMetricsData } = useSWR(
    `/api/social/metrics?${selectedActor !== "all" ? `talentId=${selectedActor}&` : ""}range=${timeRange}`,
    fetcher,
  )

  const actors = actorsData?.actors || []
  const analytics = analyticsData?.analytics || []
  const tasks = tasksData?.tasks || []
  const prItems = prData?.prItems || []
  const socialMetrics = socialMetricsData?.metrics || []

  // Process analytics data for charts
  const socialFollowersData = analytics
    .filter((item: any) => item.metric_type === "social_followers")
    .reduce((acc: any, item: any) => {
      const date = item.metric_date
      const existing = acc.find((d: any) => d.date === date)
      if (existing) {
        existing[item.platform] = item.metric_value
        existing.total += item.metric_value
      } else {
        acc.push({
          date,
          [item.platform]: item.metric_value,
          total: item.metric_value,
        })
      }
      return acc
    }, [])
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const realSocialFollowersData = socialMetrics
    .reduce((acc: any, item: any) => {
      const date = item.date
      const existing = acc.find((d: any) => d.date === date)
      if (existing) {
        existing.followers += item.followers || 0
        existing.engagement += item.engagement_rate || 0
        existing.views += item.views || 0
        existing.likes += item.likes || 0
        existing.comments += item.comments || 0
        existing.count += 1
      } else {
        acc.push({
          date,
          followers: item.followers || 0,
          engagement: item.engagement_rate || 0,
          views: item.views || 0,
          likes: item.likes || 0,
          comments: item.comments || 0,
          count: 1,
        })
      }
      return acc
    }, [])
    .map((item: any) => ({
      ...item,
      avgEngagement: item.count > 0 ? item.engagement / item.count : 0,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const platformMetrics = socialMetrics.reduce((acc: any, item: any) => {
    const platform = item.social_accounts?.platform || "unknown"
    if (!acc[platform]) {
      acc[platform] = {
        platform,
        followers: 0,
        engagement: 0,
        views: 0,
        likes: 0,
        comments: 0,
        count: 0,
      }
    }
    acc[platform].followers += item.followers || 0
    acc[platform].engagement += item.engagement_rate || 0
    acc[platform].views += item.views || 0
    acc[platform].likes += item.likes || 0
    acc[platform].comments += item.comments || 0
    acc[platform].count += 1
    return acc
  }, {})

  const platformData = Object.values(platformMetrics).map((platform: any) => ({
    ...platform,
    avgEngagement: platform.count > 0 ? platform.engagement / platform.count : 0,
  }))

  const engagementData = analytics
    .filter((item: any) => item.metric_type === "engagement_rate")
    .map((item: any) => ({
      date: item.metric_date,
      platform: item.platform,
      value: item.metric_value,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Task completion stats
  const taskStats = tasks.reduce(
    (acc: any, task: any) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    },
    { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
  )

  const taskCompletionData = [
    { name: "Completed", value: taskStats.completed, color: "#10b981" },
    { name: "In Progress", value: taskStats.in_progress, color: "#3b82f6" },
    { name: "Pending", value: taskStats.pending, color: "#f59e0b" },
    { name: "Cancelled", value: taskStats.cancelled, color: "#ef4444" },
  ]

  // PR coverage by type
  const prByType = prItems.reduce((acc: any, item: any) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})

  const prTypeData = Object.entries(prByType).map(([type, count]) => ({
    type: type.replace("_", " "),
    count,
  }))

  const totalFollowers =
    socialMetrics.reduce((sum: number, item: any) => {
      const latestFollowers = item.followers || 0
      return sum + latestFollowers
    }, 0) ||
    analytics
      .filter((item: any) => item.metric_type === "social_followers")
      .reduce((sum: number, item: any) => sum + item.metric_value, 0)

  const avgEngagement =
    socialMetrics.length > 0
      ? socialMetrics.reduce((sum: number, item: any) => sum + (item.engagement_rate || 0), 0) / socialMetrics.length
      : analytics
          .filter((item: any) => item.metric_type === "engagement_rate")
          .reduce((sum: number, item: any) => sum + item.metric_value, 0) /
          analytics.filter((item: any) => item.metric_type === "engagement_rate").length || 0

  const totalReach =
    socialMetrics.reduce((sum: number, item: any) => sum + (item.views || 0), 0) ||
    prItems.reduce((sum: number, item: any) => sum + (item.reach_estimate || 0), 0)

  const completionRate = tasks.length > 0 ? (taskStats.completed / tasks.length) * 100 : 0

  const kpis = [
    {
      title: "Total Followers",
      value: totalFollowers.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Avg Engagement",
      value: `${avgEngagement.toFixed(1)}%`,
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Total Reach",
      value: totalReach.toLocaleString(),
      change: "+8.3%",
      trend: "up",
      icon: BarChart3,
    },
    {
      title: "Task Completion",
      value: `${completionRate.toFixed(1)}%`,
      change: completionRate > 75 ? "+5.2%" : "-2.1%",
      trend: completionRate > 75 ? "up" : "down",
      icon: Target,
    },
  ]

  return (
    <PermissionGate
      permission="view_analytics"
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Access Restricted</h3>
            <p className="text-slate-600">You don't have permission to view analytics.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600 mt-1">Track performance metrics and insights for your talents.</p>
          </div>
          <div className="flex gap-3">
            <PermissionGate permission="export_data">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </PermissionGate>
            <Select value={selectedActor} onValueChange={setSelectedActor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select talent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Talents</SelectItem>
                {actors.map((actor: any) => (
                  <SelectItem key={actor.id} value={actor.id}>
                    {actor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <kpi.icon className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Social Media Growth */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Social Media Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={realSocialFollowersData.length > 0 ? realSocialFollowersData : socialFollowersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey={realSocialFollowersData.length > 0 ? "followers" : "total"}
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="followers" fill="#3b82f6" name="Followers" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Rate */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Engagement Rate Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realSocialFollowersData.length > 0 ? realSocialFollowersData : engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={realSocialFollowersData.length > 0 ? "avgEngagement" : "value"}
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Completion */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {realSocialFollowersData.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Views</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {realSocialFollowersData.reduce((sum: number, item: any) => sum + item.views, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <Eye className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Likes</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {realSocialFollowersData.reduce((sum: number, item: any) => sum + item.likes, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <Heart className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Comments</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {realSocialFollowersData
                        .reduce((sum: number, item: any) => sum + item.comments, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks
                .filter((task: any) => task.status === "completed")
                .slice(0, 5)
                .map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-slate-900">{task.title}</p>
                        <p className="text-sm text-slate-600">{task.actors?.name} • Completed</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.type.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              {tasks.filter((task: any) => task.status === "completed").length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No completed tasks yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  )
}
