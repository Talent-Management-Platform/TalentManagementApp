import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const body = await request.json()
    const { role_in_task, estimated_hours, actual_hours, notes } = body

    const { data: taskAssignment, error } = await supabase
      .from("task_assignments")
      .update({
        role_in_task,
        estimated_hours,
        actual_hours,
        notes,
      })
      .eq("id", id)
      .eq("assigned_by", user.id)
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

    return NextResponse.json({ taskAssignment })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.from("task_assignments").delete().eq("id", id).eq("assigned_by", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Task assignment deleted successfully" })
}
