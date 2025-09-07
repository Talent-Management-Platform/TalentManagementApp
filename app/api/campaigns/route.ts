import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const ownerKind = searchParams.get("owner_kind")
  const ownerId = searchParams.get("owner_id")
  const status = searchParams.get("status")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let query = supabase.from("campaigns").select("*").eq("user_id", user.id)

    if (ownerKind) {
      query = query.eq("owner_kind", ownerKind)
    }

    if (ownerId) {
      query = query.eq("owner_id", ownerId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: campaigns, error } = await query.order("created_at", { ascending: false })

    if (error) {
      // Check if it's a table not found error
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        console.log("[v0] Campaigns table not found, returning empty array")
        return NextResponse.json({ campaigns: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaigns })
  } catch (error: any) {
    console.log("[v0] Error fetching campaigns:", error.message)
    return NextResponse.json({ campaigns: [] })
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
    const body = await request.json()
    const { owner_kind, owner_id, title, vision, strategy, status, priority, start_date, end_date, budget_currency } =
      body

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        owner_kind,
        owner_id,
        title,
        vision,
        strategy,
        status: status || "planning",
        priority: priority || "medium",
        start_date,
        end_date,
        budget_currency: budget_currency || "USD",
      })
      .select()
      .single()

    if (error) {
      // Check if it's a table not found error
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          {
            error: "Campaigns system not yet set up. Please apply database scripts first.",
          },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error: any) {
    console.log("[v0] Error creating campaign:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
