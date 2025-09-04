import { type NextRequest, NextResponse } from "next/server"
import { fbAuthUrl } from "@/lib/oauth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const talentId = searchParams.get("talentId")

    if (!talentId) {
      return NextResponse.json({ error: "talentId is required" }, { status: 400 })
    }

    const state = JSON.stringify({ talentId, platform: "instagram" })
    const authUrl = fbAuthUrl(state)

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("[v0] Error in Instagram auth start:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
