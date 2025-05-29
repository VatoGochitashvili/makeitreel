
import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { changePassword } from "@/lib/profile"

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()
    
    // Get auth token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    
    // Change password
    await changePassword(payload.userId, currentPassword, newPassword)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
