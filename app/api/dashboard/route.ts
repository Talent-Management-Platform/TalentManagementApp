import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get actors count
    const { count: actorsCount } = await supabase
      .from("actors")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get tasks statistics
    const { data: tasksStats } = await supabase.from("tasks").select("status").eq("user_id", user.id)

    const tasksByStatus =
      tasksStats?.reduce((acc: any, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      }, {}) || {}

    // Get recent PR items
    const { data: recentPRItems } = await supabase
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

    // Get upcoming tasks
    const { data: upcomingTasks } = await supabase
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

    // Get recent analytics for social followers
    const { data: socialFollowers } = await supabase
      .from("analytics")
      .select(`
        *,
        actors (
          id,
          name,
          stage_name
        )
      `)
      .eq("user_id", user.id)
      .eq("metric_type", "social_followers")
      .gte("metric_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("metric_date", { ascending: false })

    // Calculate total reach from PR items
    const { data: prReachData } = await supabase
      .from("pr_items")
      .select("reach_estimate")
      .eq("user_id", user.id)
      .not("reach_estimate", "is", null)

    const totalReach = prReachData?.reduce((sum, item) => sum + (item.reach_estimate || 0), 0) || 0

    return NextResponse.json({
      dashboard: {
        actorsCount: actorsCount || 0,
        tasksByStatus,
        totalTasks: tasksStats?.length || 0,
        recentPRItems: recentPRItems || [],
        upcomingTasks: upcomingTasks || [],
        socialFollowers: socialFollowers || [],
        totalReach,
      },
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
