const { Client } = require('pg');
(async () => {
  try {
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    const r = await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    console.log('tables:', r.rows.map(r => r.tablename).join(', '));
    const s = await c.query('SELECT COUNT(*) as cnt FROM user_stats');
    console.log('user_stats_count:', s.rows[0].cnt);
    await c.end();
  } catch (e) {
    console.error('DB check error:', e.message || e);
    process.exit(1);
  }
})();
