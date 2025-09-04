import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")
    const talentId = searchParams.get("talentId")
    const range = searchParams.get("range") || "30"

    let query = supabaseAdmin
      .from("social_metrics_daily")
      .select(`
        *,
        social_accounts!inner(
          id,
          platform,
          handle,
          talent_id
        )
      `)
      .gte("date", new Date(Date.now() - Number.parseInt(range) * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      .order("date", { ascending: false })

    if (accountId) {
      query = query.eq("account_id", accountId)
    } else if (talentId) {
      query = query.eq("social_accounts.talent_id", talentId)
    } else {
      return NextResponse.json({ error: "accountId or talentId is required" }, { status: 400 })
    }

    const { data: metrics, error } = await query

    if (error) {
      console.error("[v0] Error fetching social metrics:", error)
      return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("[v0] Error in social metrics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
