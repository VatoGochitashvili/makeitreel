
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, verification email would be sent to:', email, 'with code:', code)
    return true
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Verify Your Email - MakeItReel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f766e; text-align: center;">Verify Your Email</h2>
          <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
          <div style="background: #f0f9ff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #0f766e; font-size: 32px; margin: 0; letter-spacing: 8px;">${code}</h1>
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this verification, please ignore this email.</p>
        </div>
      `
    })
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}
