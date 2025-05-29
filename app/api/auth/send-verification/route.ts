import { NextRequest, NextResponse } from 'next/server'
import { emailExists, generateVerificationCode, storeVerificationCode } from '@/lib/database'
import { Resend } from 'resend'

const resend = new Resend('re_Hqts7eq6_Fx2Jmcbscs7J3MvAAZuBKG1c')

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

    // Send verification email using Resend
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Email Verification</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    })

    return NextResponse.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}
