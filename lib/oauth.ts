export const youtubeScopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
]

export function youtubeAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    redirect_uri: process.env.YOUTUBE_REDIRECT_URI!,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: youtubeScopes.join(" "),
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export const fbScopes = [
  "pages_show_list",
  "pages_manage_metadata",
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_manage_insights",
  "pages_read_engagement",
  "pages_manage_engagement",
]

export function fbAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: process.env.FB_REDIRECT_URI!,
    response_type: "code",
    scope: fbScopes.join(","),
    state,
  })
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
}
