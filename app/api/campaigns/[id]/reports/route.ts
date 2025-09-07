import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const body = await request.json()
    const { window } = body

    if (!["24h", "48h", "3d", "7d"].includes(window)) {
      return NextResponse.json({ error: "Invalid window. Must be one of: 24h, 48h, 3d, 7d" }, { status: 400 })
    }

    // Generate report data using the database function
    const { data: reportData, error: reportError } = await supabase.rpc("generate_campaign_report_data", {
      campaign_uuid: id,
      report_window: window,
    })

    if (reportError) {
      if (reportError.message.includes("does not exist") || reportError.message.includes("schema cache")) {
        return NextResponse.json(
          { error: "Campaign reports system not yet set up. Please apply database scripts first." },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: reportError.message }, { status: 500 })
    }

    // Save the report
    const { data: report, error } = await supabase
      .from("campaign_reports")
      .insert({
        campaign_id: id,
        window,
        kpis: reportData,
        notes: `Generated ${window} report`,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          { error: "Campaign reports system not yet set up. Please apply database scripts first." },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ report }, { status: 201 })
  } catch (error: any) {
    console.log("[v0] Error generating campaign report:", error.message)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const { data: reports, error } = await supabase
      .from("campaign_reports")
      .select("*")
      .eq("campaign_id", id)
      .order("generated_at", { ascending: false })

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json({ reports: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reports })
  } catch (error: any) {
    console.log("[v0] Error fetching campaign reports:", error.message)
    return NextResponse.json({ reports: [] })
  }
}
