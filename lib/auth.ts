import jwt from 'jsonwebtoken'
import type { UserWithSubscription } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production'

export interface JWTPayload {
  userId: number
  email: string
}

export function generateToken(user: UserWithSubscription): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Re-export database functions for server-side use only
export async function authenticateUser(email: string, password: string) {
  // Import inside function to avoid bundling in client
  const { getUserByEmail, verifyPassword } = await import('./database')

  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.password_hash) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return user;
}

export async function createUser(email: string, password: string, name: string) {
  const { createUser: dbCreateUser } = await import('./database')
  return dbCreateUser(email, password, name)
}

export async function emailExists(email: string) {
  const { emailExists: dbEmailExists } = await import('./database')
  return dbEmailExists(email)
}