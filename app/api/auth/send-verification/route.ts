
import { NextRequest, NextResponse } from 'next/server'
import { emailExists, generateVerificationCode, storeVerificationCode } from '@/lib/database'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if email already exists
    if (await emailExists(email)) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Generate and store verification code
    const code = generateVerificationCode()
    await storeVerificationCode(email, code)

    // Send verification email
    const emailSent = await sendVerificationEmail(email, code)
    
    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}
