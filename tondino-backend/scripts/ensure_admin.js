const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

(async () => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('Please set DATABASE_URL');
      process.exit(2);
    }

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    const res = await client.query("SELECT id, email FROM users WHERE is_admin = true LIMIT 1");
    if (res.rows.length > 0) {
      console.log('Admin user already exists:', res.rows[0].email);
      await client.end();
      process.exit(0);
    }

    const email = process.env.ADMIN_EMAIL || 'admin@local.test';
    const name = process.env.ADMIN_NAME || 'Admin';
    const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString('hex');
    const password_hash = await bcrypt.hash(password, 12);

    const insert = await client.query(
      'INSERT INTO users (email, password_hash, name, is_admin, is_active) VALUES ($1, $2, $3, true, true) RETURNING id',
      [email, password_hash, name]
    );

    console.log('Created admin user:', email);
    if (!process.env.ADMIN_PASSWORD) console.log('Generated password:', password);

    await client.end();
    process.exit(0);
  } catch (e) {
    console.error('ensure_admin error:', e.message || e);
    process.exit(1);
  }
})();
