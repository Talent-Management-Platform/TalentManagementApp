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

    const { data: budgetItems, error } = await supabase
      .from("campaign_budget_items")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json({ budgetItems: [], total: 0 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total = budgetItems.reduce((sum, item) => sum + Number(item.amount), 0)

    return NextResponse.json({ budgetItems, total })
  } catch (error: any) {
    console.log("[v0] Error fetching campaign budget:", error.message)
    return NextResponse.json({ budgetItems: [], total: 0 })
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
    const { item, amount, category, notes } = body

    const { data: budgetItem, error } = await supabase
      .from("campaign_budget_items")
      .insert({
        campaign_id: id,
        item,
        amount: Number(amount),
        category,
        notes,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          { error: "Campaign budget system not yet set up. Please apply database scripts first." },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ budgetItem }, { status: 201 })
  } catch (error: any) {
    console.log("[v0] Error creating budget item:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
