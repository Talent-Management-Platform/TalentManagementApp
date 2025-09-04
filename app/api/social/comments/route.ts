import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const talentId = searchParams.get("talentId")
    const platform = searchParams.get("platform")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const { data: tableExists } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "social_comments")
      .single()

    if (!tableExists) {
      console.log("[v0] Social comments table not found, returning empty data")
      return NextResponse.json({ comments: [] })
    }

    let query = supabaseAdmin
      .from("social_comments")
      .select(`
        *,
        social_posts!inner(
          id,
          title,
          url,
          platform,
          social_accounts!inner(
            id,
            talent_id,
            platform,
            handle
          )
        )
      `)
      .order("created_at_platform", { ascending: false })
      .limit(limit)

    if (talentId) {
      query = query.eq("social_posts.social_accounts.talent_id", talentId)
    }

    if (platform && platform !== "all") {
      query = query.eq("platform", platform)
    }

    const { data: comments, error } = await query

    if (error) {
      console.error("[v0] Error fetching social comments:", error)
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
    }

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("[v0] Error in social comments API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
