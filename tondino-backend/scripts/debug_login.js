
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

async function debugLogin() {
  try {
    const email = 'admin@tondino.local'; // The email we are trying
    const password = 'DevAdmin2026!';   // The password we are trying

    console.log(`Checking user: ${email}`);
    
    // 1. Fetch user
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (res.rows.length === 0) {
      console.log('❌ User not found in database!');
      
      // List all users to see if there's a typo/case issue
      const allUsers = await pool.query('SELECT id, email FROM users');
      console.log('Available users:', allUsers.rows);
      return;
    }

    const user = res.rows[0];
    console.log(`✅ User found: ID=${user.id}, is_active=${user.is_active}, is_admin=${user.is_admin}`);

    // 2. Compare password
    console.log('Comparing password...');
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (match) {
      console.log('✅ Password Match! Login should work.');
    } else {
      console.log('❌ Password Mismatch!');
      console.log('Hash in DB:', user.password_hash);
      
      // Attempt to re-hash and update to fix it
      console.log('Fixing password now...');
      const newHash = await bcrypt.hash(password, 12);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
      console.log('✅ Password updated. Try logging in again.');
    }

  } catch (err) {
    console.error('Debug Error:', err);
  } finally {
    await pool.end();
  }
}

debugLogin();
