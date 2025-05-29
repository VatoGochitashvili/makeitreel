import type { User, UserWithSubscription } from './database'

async function dbRequest(action: string, data: any) {
  const response = await fetch('/api/db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, data }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Database operation failed')
  }

  return response.json()
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  provider: string = 'email'
): Promise<User> {
  const { user } = await dbRequest('createUser', { email, password, name, provider })
  return user
}

export async function createGoogleUser(
  email: string,
  name: string,
  imageUrl?: string
): Promise<User> {
  const { user } = await dbRequest('createGoogleUser', { email, name, imageUrl })
  return user
}

export async function getUserByEmail(email: string): Promise<UserWithSubscription | null> {
  const { user } = await dbRequest('getUserByEmail', { email })
  return user
}

export async function getUserById(id: number): Promise<UserWithSubscription | null> {
  const { user } = await dbRequest('getUserById', { id })
  return user
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const { isValid } = await dbRequest('verifyPassword', { password, hashedPassword })
  return isValid
}

export async function emailExists(email: string): Promise<boolean> {
  const { exists } = await dbRequest('emailExists', { email })
  return exists
}

export async function createTestSubscription(
  userId: number,
  plan: 'pro' | 'expert' | 'business'
): Promise<void> {
  await dbRequest('createTestSubscription', { userId, plan })
} 