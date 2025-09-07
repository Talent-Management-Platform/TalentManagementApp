import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          { error: "Campaigns system not yet set up. Please apply database scripts first." },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate progress percentage
    const { data: progressData } = await supabase.rpc("calculate_campaign_progress", { campaign_uuid: id })

    const campaignWithProgress = {
      ...campaign,
      progress_pct: progressData || 0,
    }

    return NextResponse.json({ campaign: campaignWithProgress })
  } catch (error: any) {
    console.log("[v0] Error fetching campaign:", error.message)
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { title, vision, strategy, status, priority, start_date, end_date, budget_currency } = body

    const updateData: any = { updated_at: new Date().toISOString() }

    if (title !== undefined) updateData.title = title
    if (vision !== undefined) updateData.vision = vision
    if (strategy !== undefined) updateData.strategy = strategy
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (budget_currency !== undefined) updateData.budget_currency = budget_currency

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          { error: "Campaigns system not yet set up. Please apply database scripts first." },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.log("[v0] Error updating campaign:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
