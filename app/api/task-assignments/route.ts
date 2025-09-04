import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get("task_id")
  const teamMemberId = searchParams.get("team_member_id")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error: tableCheckError } = await supabase.from("task_assignments").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.log("[v0] Task assignments table not found, returning empty data")
      return NextResponse.json({ taskAssignments: [] })
    }

    let query = supabase
      .from("task_assignments")
      .select(`
        *,
        tasks (
          id,
          title,
          status,
          priority,
          due_date
        ),
        team_members (
          id,
          name,
          email,
          role
        )
      `)
      .eq("assigned_by", user.id)

    if (taskId) {
      query = query.eq("task_id", taskId)
    }

    if (teamMemberId) {
      query = query.eq("team_member_id", teamMemberId)
    }

    const { data: taskAssignments, error } = await query.order("assigned_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ taskAssignments })
  } catch (error) {
    console.error("[v0] Error fetching task assignments:", error)
    return NextResponse.json({ taskAssignments: [] })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { error: tableCheckError } = await supabase.from("task_assignments").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Task assignments feature not yet available. Please apply database scripts." },
        { status: 503 },
      )
    }

    const body = await request.json()
    const { task_id, team_member_id, role_in_task, estimated_hours, notes } = body

    const { data: taskAssignment, error } = await supabase
      .from("task_assignments")
      .insert({
        task_id,
        team_member_id,
        assigned_by: user.id,
        role_in_task,
        estimated_hours,
        notes,
      })
      .select(`
        *,
        tasks (
          id,
          title,
          status,
          priority,
          due_date
        ),
        team_members (
          id,
          name,
          email,
          role
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ taskAssignment }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating task assignment:", error)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
