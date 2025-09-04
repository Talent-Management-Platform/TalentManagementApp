import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(`/dashboard/talents?error=${error}`)
    }

    if (!code || !state) {
      return NextResponse.redirect("/dashboard/talents?error=missing_params")
    }

    const { talentId } = JSON.parse(state)

    // TODO: Exchange code for tokens with Google OAuth
    // For now, create a placeholder account
    const { data: account, error: dbError } = await supabaseAdmin
      .from("social_accounts")
      .insert({
        talent_id: talentId,
        platform: "youtube",
        is_connected: true,
        handle: "Connected YouTube Account",
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Error creating YouTube account:", dbError)
      return NextResponse.redirect("/dashboard/talents?error=db_error")
    }

    return NextResponse.redirect("/dashboard/talents?success=youtube_connected")
  } catch (error) {
    console.error("[v0] Error in YouTube callback:", error)
    return NextResponse.redirect("/dashboard/talents?error=callback_error")
  }
}
