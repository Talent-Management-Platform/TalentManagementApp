import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ effectiveRole: "guest", memberships: [] })
    }

    const { searchParams } = new URL(request.url)
    const talentId = searchParams.get("talentId")
    const userId = searchParams.get("userId") || user.id

    try {
      let query = supabase
        .from("memberships")
        .select(`
          *,
          talents (
            id,
            name,
            type
          )
        `)
        .eq("user_id", userId)

      // If talentId is specified, filter by talent
      if (talentId) {
        query = query.eq("talent_id", talentId)
      }

      const { data: memberships, error: membershipError } = await query

      if (membershipError) {
        if (membershipError.message?.includes("does not exist") || membershipError.message?.includes("schema cache")) {
          console.log("[v0] Memberships table not found, assigning admin role to authenticated user")
          return NextResponse.json({ effectiveRole: "admin", memberships: [] })
        }
        console.error("[v0] Error fetching memberships:", membershipError)
        return NextResponse.json({ effectiveRole: "guest", memberships: [] })
      }

      let effectiveRole = "guest"

      if (memberships && memberships.length > 0) {
        // Find the highest role
        const roleHierarchy = { admin: 4, manager: 3, assistant: 2, viewer: 1 }
        let highestRoleWeight = 0

        for (const membership of memberships) {
          const roleWeight = roleHierarchy[membership.role as keyof typeof roleHierarchy] || 0
          if (roleWeight > highestRoleWeight) {
            highestRoleWeight = roleWeight
            effectiveRole = membership.role
          }
        }
      } else {
        effectiveRole = "admin"
      }

      console.log(
        "[v0] Effective roles API - User:",
        userId,
        "Role:",
        effectiveRole,
        "Memberships:",
        memberships?.length || 0,
      )

      return NextResponse.json({
        effectiveRole,
        memberships: memberships || [],
      })
    } catch (tableError) {
      console.log("[v0] Database table error, assigning admin role:", tableError)
      return NextResponse.json({ effectiveRole: "admin", memberships: [] })
    }
  } catch (error) {
    console.error("[v0] Error in effective-roles API:", error)
    return NextResponse.json({ effectiveRole: "guest", memberships: [] })
  }
}
