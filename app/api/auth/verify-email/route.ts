
import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailCode, createUser, generateToken } from '@/lib/database'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, code, name, password } = await request.json()

    if (!email || !code || !name || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Verify the code
    const verification = await verifyEmailCode(email, code)
    
    if (!verification.valid) {
      if (verification.attempts > 5) {
        return NextResponse.json({ 
          error: 'Too many attempts. Please request a new verification code.' 
        }, { status: 429 })
      }
      return NextResponse.json({ 
        error: 'Invalid verification code',
        attemptsLeft: 5 - verification.attempts
      }, { status: 400 })
    }

    // Create the user account
    const user = await createUser(email, password, name)
    const token = generateToken(user)

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}
