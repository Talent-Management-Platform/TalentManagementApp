import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { comment_id, reply_body, created_by } = body

    if (!comment_id || !reply_body) {
      return NextResponse.json({ error: "comment_id and reply_body are required" }, { status: 400 })
    }

    // Get comment details to determine platform
    const { data: comment, error: commentError } = await supabaseAdmin
      .from("social_comments")
      .select("platform")
      .eq("id", comment_id)
      .single()

    if (commentError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    const { data: reply, error } = await supabaseAdmin
      .from("social_replies")
      .insert({
        comment_id,
        platform: comment.platform,
        reply_body,
        status: "queued",
        created_by,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating social reply:", error)
      return NextResponse.json({ error: "Failed to queue reply" }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("[v0] Error in social replies API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
