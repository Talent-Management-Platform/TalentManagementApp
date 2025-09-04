import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const talentId = searchParams.get("talentId")

    if (!talentId) {
      return NextResponse.json({ error: "talentId is required" }, { status: 400 })
    }

    const { data: accounts, error } = await supabaseAdmin
      .from("social_accounts")
      .select("*")
      .eq("talent_id", talentId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching social accounts:", error)
      return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
    }

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("[v0] Error in social accounts API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { talent_id, platform, handle, website_url } = body

    if (!talent_id || !platform) {
      return NextResponse.json({ error: "talent_id and platform are required" }, { status: 400 })
    }

    const { data: account, error } = await supabaseAdmin
      .from("social_accounts")
      .insert({
        talent_id,
        platform,
        handle,
        website_url,
        is_connected: false,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating social account:", error)
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

    return NextResponse.json({ account })
  } catch (error) {
    console.error("[v0] Error in social accounts POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
