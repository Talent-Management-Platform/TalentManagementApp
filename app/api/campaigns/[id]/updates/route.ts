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

    const { data: updates, error } = await supabase
      .from("campaign_updates")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json({ updates: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ updates })
  } catch (error: any) {
    console.log("[v0] Error fetching campaign updates:", error.message)
    return NextResponse.json({ updates: [] })
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
    const { title, body: updateBody, kind, created_by } = body

    const { data: update, error } = await supabase
      .from("campaign_updates")
      .insert({
        campaign_id: id,
        title,
        body: updateBody,
        kind: kind || "note",
        created_by,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          { error: "Campaign updates system not yet set up. Please apply database scripts first." },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for new update
    try {
      await supabase.from("notifications").insert({
        user_id: user.id,
        scope_kind: "campaign",
        scope_id: id,
        title: "New Update Posted",
        body: `Update "${title}" was posted to campaign "${campaign.title}"`,
        level: "info",
      })
    } catch (notifError) {
      // Don't fail the request if notification creation fails
      console.log("[v0] Failed to create notification:", notifError)
    }

    return NextResponse.json({ update }, { status: 201 })
  } catch (error: any) {
    console.log("[v0] Error creating campaign update:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
