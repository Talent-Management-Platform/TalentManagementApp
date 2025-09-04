import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role")
  const status = searchParams.get("status")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let query = supabase.from("team_members").select("*").eq("user_id", user.id)

    if (role) {
      query = query.eq("role", role)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data: teamMembers, error } = await query.order("created_at", { ascending: false })

    if (error) {
      // Check if it's a table not found error
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        console.log("[v0] Team members table not found, returning empty array")
        return NextResponse.json({ teamMembers: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ teamMembers })
  } catch (error: any) {
    console.log("[v0] Error fetching team members:", error.message)
    return NextResponse.json({ teamMembers: [] })
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
    const { name, email, role, department, phone, bio, skills, hourly_rate, hire_date, profile_image_url } = body

    const { data: teamMember, error } = await supabase
      .from("team_members")
      .insert({
        user_id: user.id,
        name,
        email,
        role,
        department,
        phone,
        bio,
        skills,
        hourly_rate,
        hire_date,
        profile_image_url,
      })
      .select()
      .single()

    if (error) {
      // Check if it's a table not found error
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          {
            error: "Team management system not yet set up. Please apply database scripts first.",
          },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ teamMember }, { status: 201 })
  } catch (error: any) {
    console.log("[v0] Error creating team member:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
