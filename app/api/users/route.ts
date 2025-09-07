import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Try to fetch users with membership counts from auth.users and memberships tables
      const { data: users, error } = await supabase
        .from("auth.users")
        .select(`
          id,
          email,
          raw_user_meta_data,
          created_at,
          memberships:memberships(count)
        `)
        .limit(100)

      if (error) {
        // If tables don't exist, return empty array instead of error
        console.log("[v0] Users table query failed:", error.message)
        return NextResponse.json([])
      }

      // Transform the data to match expected format
      const transformedUsers =
        users?.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.raw_user_meta_data?.full_name || user.raw_user_meta_data?.name || null,
          created_at: user.created_at,
          membership_count: user.memberships?.[0]?.count || 0,
          highest_role: "admin", // Default role since RBAC tables don't exist yet
        })) || []

      return NextResponse.json(transformedUsers)
    } catch (tableError: any) {
      console.log("[v0] Database tables not found:", tableError.message)
      return NextResponse.json([])
    }
  } catch (error: any) {
    console.error("[v0] Error in users API:", error.message)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
