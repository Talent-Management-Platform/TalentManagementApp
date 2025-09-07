import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    let query = supabase.from("campaign_tasks").select("*").eq("campaign_id", id)

    if (status) {
      query = query.eq("status", status)
    }

    if (priority) {
      query = query.eq("priority", priority)
    }

    const { data: tasks, error } = await query.order("created_at", { ascending: false })

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json({ tasks: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.log("[v0] Error fetching campaign tasks:", error.message)
    return NextResponse.json({ tasks: [] })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id, title")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, assignee, approver, status, priority, due_at, success_criteria } = body

    const { data: task, error } = await supabase
      .from("campaign_tasks")
      .insert({
        campaign_id: id,
        title,
        description,
        assignee,
        approver,
        status: status || "todo",
        priority: priority || "p2",
        due_at,
        success_criteria,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          { error: "Campaign tasks system not yet set up. Please apply database scripts first." },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for new task
    try {
      await supabase.from("notifications").insert({
        user_id: user.id,
        scope_kind: "campaign",
        scope_id: id,
        title: "New Task Created",
        body: `Task "${title}" was added to campaign "${campaign.title}"`,
        level: "info",
      })
    } catch (notifError) {
      // Don't fail the request if notification creation fails
      console.log("[v0] Failed to create notification:", notifError)
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: any) {
    console.log("[v0] Error creating campaign task:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
