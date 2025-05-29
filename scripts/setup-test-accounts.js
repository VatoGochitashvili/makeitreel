
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function setupTestAccounts() {
  const client = await pool.connect();
  
  try {
    // Hash the password "Example1!"
    const hashedPassword = await bcrypt.hash('Example1!', 12);
    
    console.log('Setting up test accounts with password: Example1!');
    
    // Create test users
    const testUsers = [
      { email: 'test@example.com', name: 'Test User', plan: 'pro' },
      { email: 'expert@example.com', name: 'Expert User', plan: 'expert' },
      { email: 'business@example.com', name: 'Business User', plan: 'business' }
    ];
    
    for (const user of testUsers) {
      // Check if user exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      
      let userId;
      if (existingUser.rows.length > 0) {
        // Update existing user
        await client.query(
          'UPDATE users SET password_hash = $1, name = $2 WHERE email = $3',
          [hashedPassword, user.name, user.email]
        );
        userId = existingUser.rows[0].id;
        console.log(`✓ Updated existing user: ${user.email}`);
      } else {
        // Create new user
        const userResult = await client.query(
          'INSERT INTO users (email, password_hash, name, provider) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.email, hashedPassword, user.name, 'email']
        );
        userId = userResult.rows[0].id;
        console.log(`✓ Created new user: ${user.email}`);
      }
      
      // Check if subscription exists
      const existingSubscription = await client.query('SELECT id FROM subscriptions WHERE user_id = $1', [userId]);
      
      if (existingSubscription.rows.length > 0) {
        // Update existing subscription
        await client.query(
          'UPDATE subscriptions SET plan = $1, status = $2, expires_at = $3 WHERE user_id = $4',
          [user.plan, 'active', '2025-12-31', userId]
        );
        console.log(`✓ Updated subscription for ${user.email} with ${user.plan} plan`);
      } else {
        // Create new subscription
        await client.query(
          'INSERT INTO subscriptions (user_id, plan, status, billing_cycle, expires_at) VALUES ($1, $2, $3, $4, $5)',
          [userId, user.plan, 'active', 'yearly', '2025-12-31']
        );
        console.log(`✓ Created subscription for ${user.email} with ${user.plan} plan`);
      }
    }
    
    console.log('All test accounts set up successfully!');
    
  } catch (error) {
    console.error('Error setting up test accounts:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupTestAccounts();
