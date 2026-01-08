const { Client } = require('pg');
(async () => {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error('Please set DATABASE_URL');
      process.exit(2);
    }
    const c = new Client({ connectionString: DATABASE_URL });
    await c.connect();
    const u = await c.query("SELECT id,email,is_admin,is_active,created_at FROM users ORDER BY id DESC LIMIT 5");
    console.log('recent users:', u.rows);
    const s = await c.query("SELECT * FROM user_stats LIMIT 5");
    console.log('user_stats sample:', s.rows);
    await c.end();
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
})();
