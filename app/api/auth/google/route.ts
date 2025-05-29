import { NextResponse } from 'next/server'
import { getUserByEmail, createGoogleUser } from '@/lib/database'
import { generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, name, picture } = await request.json()
    
    // Check if Google user exists in database
    let user = await getUserByEmail(email)
    
    if (!user) {
      // Create new Google user
      user = await createGoogleUser(email, name, picture)
    }
    
    const token = generateToken(user)
    return NextResponse.json({ token, user })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 