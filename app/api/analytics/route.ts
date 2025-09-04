import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const actorId = searchParams.get("actor_id")
  const metricType = searchParams.get("metric_type")
  const platform = searchParams.get("platform")
  const startDate = searchParams.get("start_date")
  const endDate = searchParams.get("end_date")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let query = supabase
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

  if (actorId) {
    query = query.eq("actor_id", actorId)
  }

  if (metricType) {
    query = query.eq("metric_type", metricType)
  }

  if (platform) {
    query = query.eq("platform", platform)
  }

  if (startDate) {
    query = query.gte("metric_date", startDate)
  }

  if (endDate) {
    query = query.lte("metric_date", endDate)
  }

  const { data: analytics, error } = await query.order("metric_date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ analytics })
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
    const { actor_id, metric_type, metric_value, metric_date, platform, metadata } = body

    const { data: analytic, error } = await supabase
      .from("analytics")
      .insert({
        user_id: user.id,
        actor_id,
        metric_type,
        metric_value,
        metric_date,
        platform,
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

    return NextResponse.json({ analytic }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
