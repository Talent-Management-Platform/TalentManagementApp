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

    const { data: members, error } = await supabase
      .from("campaign_members")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json({ members: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ members })
  } catch (error: any) {
    console.log("[v0] Error fetching campaign members:", error.message)
    return NextResponse.json({ members: [] })
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
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const body = await request.json()
    const { role, user_name, email, phone } = body

    const { data: member, error } = await supabase
      .from("campaign_members")
      .insert({
        campaign_id: id,
        role,
        user_name,
        email,
        phone,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          { error: "Campaign members system not yet set up. Please apply database scripts first." },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member }, { status: 201 })
  } catch (error: any) {
    console.log("[v0] Error creating campaign member:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
