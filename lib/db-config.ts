import { Pool } from 'pg'

// Only create the pool on the server side
const pool = typeof window === 'undefined' 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null

export default pool 