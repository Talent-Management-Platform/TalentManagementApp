import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const scopeKind = searchParams.get("scope_kind")
  const scopeId = searchParams.get("scope_id")
  const unreadOnly = searchParams.get("unread_only") === "true"

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let query = supabase.from("notifications").select("*").eq("user_id", user.id)

    if (scopeKind) {
      query = query.eq("scope_kind", scopeKind)
    }

    if (scopeId) {
      query = query.eq("scope_id", scopeId)
    }

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data: notifications, error } = await query.order("created_at", { ascending: false }).limit(50)

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json({ notifications: [], unreadCount: 0 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    return NextResponse.json({ notifications, unreadCount: unreadCount || 0 })
  } catch (error: any) {
    console.log("[v0] Error fetching notifications:", error.message)
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}

export async function PATCH(request: NextRequest) {
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
    const { action, notificationIds } = body

    if (action === "mark_read") {
      let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)

      if (notificationIds && notificationIds.length > 0) {
        query = query.in("id", notificationIds)
      }

      const { error } = await query

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          return NextResponse.json(
            { error: "Notifications system not yet set up. Please apply database scripts first." },
            { status: 503 },
          )
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ message: "Notifications marked as read" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.log("[v0] Error updating notifications:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
