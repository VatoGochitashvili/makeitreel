import { NextResponse } from 'next/server'
import { 
  createUser, 
  createGoogleUser, 
  getUserByEmail, 
  getUserById, 
  verifyPassword, 
  emailExists, 
  createTestSubscription 
} from '@/lib/database'
import { generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'createUser': {
        const { email, password, name, provider } = data
        const user = await createUser(email, password, name, provider)
        return NextResponse.json({ user })
      }

      case 'createGoogleUser': {
        const { email, name, imageUrl } = data
        const user = await createGoogleUser(email, name, imageUrl)
        return NextResponse.json({ user })
      }

      case 'getUserByEmail': {
        const { email } = data
        const user = await getUserByEmail(email)
        return NextResponse.json({ user })
      }

      case 'getUserById': {
        const { id } = data
        const user = await getUserById(id)
        return NextResponse.json({ user })
      }

      case 'verifyPassword': {
        const { password, hashedPassword } = data
        const isValid = await verifyPassword(password, hashedPassword)
        return NextResponse.json({ isValid })
      }

      case 'emailExists': {
        const { email } = data
        const exists = await emailExists(email)
        return NextResponse.json({ exists })
      }

      case 'createTestSubscription': {
        const { userId, plan } = data
        await createTestSubscription(userId, plan)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Database operation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 