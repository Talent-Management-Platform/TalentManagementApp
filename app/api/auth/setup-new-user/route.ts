import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[v0] Setting up new user:", user_id)

    // Generate sample data for the new user
    const { error: sampleDataError } = await supabase.rpc("generate_sample_data_for_user", {
      target_user_id: user_id,
    })

    if (sampleDataError) {
      console.error("[v0] Sample data generation error:", sampleDataError)
    } else {
      console.log("[v0] Sample data generated successfully")
    }

    // Assign admin role to the new user
    const { error: roleError } = await supabase.from("memberships").insert({
      user_id: user_id,
      role: "admin",
      talent_id: null, // org-wide admin
    })

    if (roleError) {
      console.error("[v0] Role assignment error:", roleError)
    } else {
      console.log("[v0] Admin role assigned successfully")
    }

    return NextResponse.json({
      success: true,
      sampleDataGenerated: !sampleDataError,
      roleAssigned: !roleError,
    })
  } catch (error) {
    console.error("[v0] Setup new user error:", error)
    return NextResponse.json({ error: "Setup failed" }, { status: 500 })
  }
}
