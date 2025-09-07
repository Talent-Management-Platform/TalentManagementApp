import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: brands, error } = await supabase
      .from("brands")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      // Check if it's a table not found error
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        console.log("[v0] Brands table not found, returning empty array")
        return NextResponse.json({ brands: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ brands })
  } catch (error: any) {
    console.log("[v0] Error fetching brands:", error.message)
    return NextResponse.json({ brands: [] })
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
    const { name, logo, bio, website, categories } = body

    const { data: brand, error } = await supabase
      .from("brands")
      .insert({
        user_id: user.id,
        name,
        logo,
        bio,
        website,
        categories: categories || [],
      })
      .select()
      .single()

    if (error) {
      // Check if it's a table not found error
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          {
            error: "Brands system not yet set up. Please apply database scripts first.",
          },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ brand }, { status: 201 })
  } catch (error: any) {
    console.log("[v0] Error creating brand:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
