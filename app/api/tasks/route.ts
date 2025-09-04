import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const actorId = searchParams.get("actor_id")
  const status = searchParams.get("status")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let query = supabase
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

  if (actorId) {
    query = query.eq("actor_id", actorId)
  }

  if (status) {
    query = query.eq("status", status)
  }

  const { data: tasks, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tasks })
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
    const body = await request.json()
    const { actor_id, title, description, type, status, priority, due_date, notes, metadata } = body

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        actor_id,
        title,
        description,
        type,
        status,
        priority,
        due_date,
        notes,
        metadata,
      })
      .select(`
        *,
        actors (
          id,
          name,
          stage_name
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
