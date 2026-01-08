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

    const missing = await c.query("SELECT u.id FROM users u LEFT JOIN user_stats s ON u.id = s.user_id WHERE s.user_id IS NULL");
    if (missing.rows.length === 0) {
      console.log('No users missing user_stats');
      await c.end();
      process.exit(0);
    }

    const now = new Date().toISOString();
    for (const r of missing.rows) {
      await c.query(
        `INSERT INTO user_stats (user_id, top_speed, points, reading_minutes, courses_completed, current_streak, updated_at)
         VALUES ($1, 0, 0, 0, 0, 0, $2)`,
        [r.id, now]
      );
      console.log('Inserted user_stats for user_id', r.id);
    }

    const cnt = await c.query('SELECT COUNT(*) as cnt FROM user_stats');
    console.log('Total user_stats rows:', cnt.rows[0].cnt);

    await c.end();
    process.exit(0);
  } catch (e) {
    console.error('populate_user_stats error:', e.message || e);
    process.exit(1);
  }
})();
