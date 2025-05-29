
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=no_code", request.url))
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenResponse.json()

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const userData = await userResponse.json()
    
    // Create a User object from Google data - ALL Google users get basic mode (no subscription)
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.picture,
      subscription: undefined // Google users start with no subscription (basic mode)
    }

    // Create the response with user data encoded in URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
    
    // Set user data as a cookie or pass via URL params for client-side handling
    const userParam = encodeURIComponent(JSON.stringify(user))
    const redirectUrl = new URL('/', baseUrl)
    redirectUrl.searchParams.set('user', userParam)
    
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("OAuth error:", error)
    return NextResponse.redirect(new URL('/auth?error=oauth_error', request.url))
  }
}
