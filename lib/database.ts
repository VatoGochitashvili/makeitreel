import bcrypt from 'bcryptjs'
import pool from './db-config'
import { generateToken } from './auth'

export interface User {
  id: number
  email: string
  password_hash?: string
  name: string
  image_url?: string
  provider: string
  created_at: Date
  updated_at: Date
}

export interface Subscription {
  id: number
  user_id: number
  plan: 'basic' | 'pro' | 'expert' | 'business'
  status: 'active' | 'cancelled' | 'expired'
  billing_cycle: 'monthly' | 'yearly'
  expires_at?: Date
  created_at: Date
}

export interface UserWithSubscription extends User {
  subscription?: Subscription
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Create user
export async function createUser(
  email: string,
  password: string,
  name: string,
  provider: string = 'email'
): Promise<User> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    const hashedPassword = await hashPassword(password)

    const result = await client.query(
      'INSERT INTO users (email, password_hash, name, provider) VALUES ($1, $2, $3, $4) RETURNING *',
      [email.toLowerCase(), hashedPassword, name, provider]
    )

    return result.rows[0]
  } finally {
    client.release()
  }
}

// Create Google user
export async function createGoogleUser(
  email: string,
  name: string,
  imageUrl?: string
): Promise<User> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    const result = await client.query(
      'INSERT INTO users (email, password_hash, name, image_url, provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email.toLowerCase(), '', name, imageUrl, 'google']
    )

    return result.rows[0]
  } finally {
    client.release()
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<UserWithSubscription | null> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        u.*,
        s.id as subscription_id,
        s.plan,
        s.status as subscription_status,
        s.billing_cycle,
        s.expires_at
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.email = $1
    `, [email.toLowerCase()])

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    const user: UserWithSubscription = {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      name: row.name,
      image_url: row.image_url,
      provider: row.provider,
      created_at: row.created_at,
      updated_at: row.updated_at
    }

    if (row.plan) {
      user.subscription = {
        id: row.subscription_id,
        user_id: row.id,
        plan: row.plan,
        status: row.subscription_status,
        billing_cycle: row.billing_cycle,
        expires_at: row.expires_at,
        created_at: row.created_at
      }
    }

    return user
  } finally {
    client.release()
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<UserWithSubscription | null> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    const result = await client.query(`
      SELECT 
        u.*,
        s.id as subscription_id,
        s.plan,
        s.status as subscription_status,
        s.billing_cycle,
        s.expires_at
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.id = $1
    `, [id])

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    const user: UserWithSubscription = {
      id: row.id,
      email: row.email,
      password_hash: row.password_hash,
      name: row.name,
      image_url: row.image_url,
      provider: row.provider,
      created_at: row.created_at,
      updated_at: row.updated_at
    }

    if (row.plan) {
      user.subscription = {
        id: row.subscription_id,
        user_id: row.id,
        plan: row.plan,
        status: row.subscription_status,
        billing_cycle: row.billing_cycle,
        expires_at: row.expires_at,
        created_at: row.created_at
      }
    }

    return user
  } finally {
    client.release()
  }
}

// Check if email exists
export async function emailExists(email: string): Promise<boolean> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    return result.rows.length > 0
  } finally {
    client.release()
  }
}

// Create test subscription
export async function createTestSubscription(
  userId: number,
  plan: 'pro' | 'expert' | 'business'
): Promise<void> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    await client.query(
      'INSERT INTO subscriptions (user_id, plan, status, billing_cycle, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [userId, plan, 'active', 'yearly', new Date('2025-12-31')]
    )
  } finally {
    client.release()
  }
}

// Update user password
export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    const hashedPassword = await hashPassword(newPassword)
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    )
  } finally {
    client.release()
  }
}

// Generate verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store verification code
export async function storeVerificationCode(email: string, code: string): Promise<void> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    // Delete any existing codes for this email
    await client.query('DELETE FROM email_verification_codes WHERE email = $1', [email.toLowerCase()])
    
    // Insert new code with 10 minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    await client.query(
      'INSERT INTO email_verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email.toLowerCase(), code, expiresAt]
    )
  } finally {
    client.release()
  }
}

// Verify code
export async function verifyEmailCode(email: string, code: string): Promise<{ valid: boolean; attempts: number }> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    // Get the verification record
    const result = await client.query(
      'SELECT * FROM email_verification_codes WHERE email = $1 AND expires_at > NOW()',
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return { valid: false, attempts: 0 }
    }

    const record = result.rows[0]
    
    // Increment attempts
    const newAttempts = record.attempts + 1
    await client.query(
      'UPDATE email_verification_codes SET attempts = $1 WHERE id = $2',
      [newAttempts, record.id]
    )

    // Check if too many attempts
    if (newAttempts > 5) {
      await client.query('DELETE FROM email_verification_codes WHERE id = $1', [record.id])
      return { valid: false, attempts: newAttempts }
    }

    // Check if code matches
    if (record.code === code) {
      // Delete the verification code after successful verification
      await client.query('DELETE FROM email_verification_codes WHERE id = $1', [record.id])
      return { valid: true, attempts: newAttempts }
    }

    return { valid: false, attempts: newAttempts }
  } finally {
    client.release()
  }
}

// Clean up expired codes (can be called periodically)
export async function cleanupExpiredCodes(): Promise<void> {
  if (!pool) throw new Error('Database pool not initialized')
  const client = await pool.connect()
  try {
    await client.query('DELETE FROM email_verification_codes WHERE expires_at < NOW()')
  } finally {
    client.release()
  }
}