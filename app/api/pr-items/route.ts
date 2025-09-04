import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const actorId = searchParams.get("actor_id")
  const type = searchParams.get("type")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let query = supabase
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

  if (actorId) {
    query = query.eq("actor_id", actorId)
  }

  if (type) {
    query = query.eq("type", type)
  }

  const { data: prItems, error } = await query.order("published_date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prItems })
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
    const {
      actor_id,
      title,
      description,
      type,
      url,
      publication,
      author,
      published_date,
      reach_estimate,
      engagement_metrics,
      sentiment,
      tags,
      status,
    } = body

    const { data: prItem, error } = await supabase
      .from("pr_items")
      .insert({
        user_id: user.id,
        actor_id,
        title,
        description,
        type,
        url,
        publication,
        author,
        published_date,
        reach_estimate,
        engagement_metrics,
        sentiment,
        tags,
        status,
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

    return NextResponse.json({ prItem }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
