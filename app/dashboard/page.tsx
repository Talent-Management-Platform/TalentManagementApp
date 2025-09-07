import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CheckSquare, Newspaper, Calendar, Plus, Building2, Briefcase, Trophy, Star } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  console.log("[v0] Fetching comprehensive dashboard data from Supabase")

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("[v0] User:", user?.id, "Auth error:", authError)

  let data = {
    // Existing data
    actorsCount: 0,
    tasksByStatus: {},
    totalTasks: 0,
    recentPRItems: [],
    upcomingTasks: [],
    totalReach: 0,
    // New data for comprehensive overview
    brandsCount: 0,
    campaignsCount: 0,
    activeCampaigns: 0,
    topTeamMembers: [],
  }

  if (user && !authError) {
    try {
      // Get actors count
      const { count: actorsCount, error: actorsError } = await supabase
        .from("actors")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      console.log("[v0] Actors count:", actorsCount, "Error:", actorsError)

      // Get tasks statistics
      const { data: tasksStats, error: tasksError } = await supabase
        .from("tasks")
        .select("status")
        .eq("user_id", user.id)

      console.log("[v0] Tasks stats:", tasksStats?.length, "Error:", tasksError)

      const tasksByStatus =
        tasksStats?.reduce((acc: any, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1
          return acc
        }, {}) || {}

      // Get recent PR items
      const { data: recentPRItems, error: prError } = await supabase
        .from("pr_items")
        .select(`
          *,
          actors (
            id,
            name,
            stage_name
          )
        `)
        .eq("user_id", user.id)
        .order("published_date", { ascending: false })
        .limit(5)

      console.log("[v0] PR items:", recentPRItems?.length, "Error:", prError)

      // Get upcoming tasks
      const { data: upcomingTasks, error: upcomingError } = await supabase
        .from("tasks")
        .select(`
          *,
          actors (
            id,
            name,
            stage_name
          )
        `)
        .eq("user_id", user.id)
        .in("status", ["pending", "in_progress"])
        .not("due_date", "is", null)
        .gte("due_date", new Date().toISOString())
        .order("due_date", { ascending: true })
        .limit(5)

      console.log("[v0] Upcoming tasks:", upcomingTasks?.length, "Error:", upcomingError)

      // Calculate total reach from PR items
      const { data: prReachData, error: reachError } = await supabase
        .from("pr_items")
        .select("reach_estimate")
        .eq("user_id", user.id)
        .not("reach_estimate", "is", null)

      console.log("[v0] PR reach data:", prReachData?.length, "Error:", reachError)

      const totalReach = prReachData?.reduce((sum, item) => sum + (item.reach_estimate || 0), 0) || 0

      const { count: brandsCount, error: brandsError } = await supabase
        .from("brands")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      console.log("[v0] Brands count:", brandsCount, "Error:", brandsError)

      const { count: campaignsCount, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)

      console.log("[v0] Campaigns count:", campaignsCount, "Error:", campaignsError)

      const { count: activeCampaigns, error: activeCampaignsError } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("status", "active")

      console.log("[v0] Active campaigns:", activeCampaigns, "Error:", activeCampaignsError)

      let topTeamMembers = []
      try {
        const { data: teamMembersData, error: teamError } = await supabase
          .from("team_members")
          .select("name, role, completed_tasks")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("completed_tasks", { ascending: false })
          .limit(5)

        topTeamMembers = teamMembersData || []
        console.log("[v0] Top team members:", topTeamMembers?.length, "Error:", teamError)
      } catch (error) {
        console.log("[v0] Team members table not available yet")
      }

      data = {
        actorsCount: actorsCount || 0,
        tasksByStatus,
        totalTasks: tasksStats?.length || 0,
        recentPRItems: recentPRItems || [],
        upcomingTasks: upcomingTasks || [],
        totalReach,
        brandsCount: brandsCount || 0,
        campaignsCount: campaignsCount || 0,
        activeCampaigns: activeCampaigns || 0,
        topTeamMembers,
      }
    } catch (error) {
      console.error("[v0] Dashboard data fetch error:", error)
    }
  } else {
    console.log("[v0] No authenticated user, showing empty dashboard")
  }

  const stats = [
    {
      name: "Total Talents",
      value: data.actorsCount,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/talents",
    },
    {
      name: "Total Brands",
      value: data.brandsCount,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/dashboard/brands",
    },
    {
      name: "Active Campaigns",
      value: data.activeCampaigns,
      icon: Briefcase,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/dashboard/campaigns",
    },
    {
      name: "Active Tasks",
      value: (data.tasksByStatus.pending || 0) + (data.tasksByStatus.in_progress || 0),
      icon: CheckSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/dashboard/tasks",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Complete overview of your talents, brands, campaigns, and team performance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/campaigns">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/tasks">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upcoming Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/tasks">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.upcomingTasks.length > 0 ? (
              data.upcomingTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{task.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {task.actors?.name} • Due {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No upcoming tasks</p>
                <Button variant="ghost" size="sm" asChild className="mt-2">
                  <Link href="/dashboard/tasks">Create your first task</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent PR Items */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Recent PR & Media</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/pr">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentPRItems.length > 0 ? (
              data.recentPRItems.slice(0, 3).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {item.publication} • {item.actors?.name}
                    </p>
                    {item.reach_estimate && (
                      <p className="text-xs text-slate-500 mt-1">Reach: {item.reach_estimate.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                    {item.sentiment && (
                      <Badge
                        className={
                          item.sentiment === "positive"
                            ? "bg-green-100 text-green-800"
                            : item.sentiment === "negative"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.sentiment}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Newspaper className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No recent PR items</p>
                <Button variant="ghost" size="sm" asChild className="mt-2">
                  <Link href="/dashboard/pr">Add your first PR item</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Top Performing Team</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/team">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topTeamMembers.length > 0 ? (
              data.topTeamMembers.map((member: any, index: number) => (
                <div key={member.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{member.name}</h4>
                      <p className="text-sm text-slate-600">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-slate-900">{member.completed_tasks || 0} tasks</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No team performance data</p>
                <Button variant="ghost" size="sm" asChild className="mt-2">
                  <Link href="/dashboard/team">Add team members</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{data.totalReach.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Total Reach</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{data.campaignsCount}</div>
              <div className="text-sm text-slate-600">Total Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{data.totalTasks}</div>
              <div className="text-sm text-slate-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{data.recentPRItems.length}</div>
              <div className="text-sm text-slate-600">PR Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
