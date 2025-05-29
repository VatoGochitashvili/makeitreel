import { NextResponse } from 'next/server'
import { getUserById, getUserByEmail, createUser, createGoogleUser, verifyPassword, emailExists, createTestSubscription } from '@/lib/database'
import { generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { action, provider, credentials } = await request.json()

    if (action === 'login') {
      if (provider === 'email') {
        const { email, password } = credentials
        
        // Get user from database
        const dbUser = await getUserByEmail(email)
        
        if (!dbUser) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        if (dbUser.provider === 'google') {
          return NextResponse.json({ error: 'This email is registered with Google. Please use Google login.' }, { status: 401 })
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, dbUser.password_hash || '')
        if (!isValidPassword) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }

        // Generate JWT token
        const token = generateToken(dbUser)
        return NextResponse.json({ token, user: dbUser })
      }
    }

    if (action === 'signup') {
      const { email, password, name } = credentials
      
      // Check if email already exists
      if (await emailExists(email)) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
      }
      
      // Create new user
      const dbUser = await createUser(email, password, name)
      
      // Check if it's a test account and create subscription
      const TEST_ACCOUNTS = {
        "test@example.com": { plan: "pro" as const },
        "expert@example.com": { plan: "expert" as const },
        "business@example.com": { plan: "business" as const }
      }
      
      const testAccount = TEST_ACCOUNTS[email.toLowerCase() as keyof typeof TEST_ACCOUNTS]
      if (testAccount) {
        await createTestSubscription(dbUser.id, testAccount.plan)
        // Fetch user again to get subscription data
        const updatedUser = await getUserById(dbUser.id)
        if (updatedUser) {
          const token = generateToken(updatedUser)
          return NextResponse.json({ token, user: updatedUser })
        }
      }

      const token = generateToken(dbUser)
      return NextResponse.json({ token, user: dbUser })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 