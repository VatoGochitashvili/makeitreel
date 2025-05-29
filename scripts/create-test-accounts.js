
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestAccounts() {
  const password = 'Example1!';
  const saltRounds = 10;
  
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed password:', hashedPassword);
    
    const client = await pool.connect();
    
    // Insert test accounts
    const testAccounts = [
      { email: 'test@example.com', name: 'Test User', plan: 'pro' },
      { email: 'expert@example.com', name: 'Expert User', plan: 'expert' },
      { email: 'business@example.com', name: 'Business User', plan: 'business' }
    ];
    
    for (const account of testAccounts) {
      // Insert or update user
      const userResult = await client.query(`
        INSERT INTO users (email, password_hash, name, provider) 
        VALUES ($1, $2, $3, 'email')
        ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name
        RETURNING id
      `, [account.email, hashedPassword, account.name]);
      
      const userId = userResult.rows[0].id;
      
      // Insert or update subscription
      await client.query(`
        INSERT INTO subscriptions (user_id, plan, status) 
        VALUES ($1, $2, 'active')
        ON CONFLICT (user_id) DO UPDATE SET
        plan = EXCLUDED.plan,
        status = EXCLUDED.status
      `, [userId, account.plan]);
      
      console.log(`Created/updated account: ${account.email} with plan: ${account.plan}`);
    }
    
    client.release();
    console.log('Test accounts created successfully!');
  } catch (error) {
    console.error('Error creating test accounts:', error);
  } finally {
    await pool.end();
  }
}

createTestAccounts();
