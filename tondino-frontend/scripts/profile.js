const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function run() {
  const outDir = path.resolve(__dirname, '../profile-output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const tracePath = path.join(outDir, 'trace.json');
  const metricsPath = path.join(outDir, 'metrics.json');

  const routes = ['/', '/courses', '/dashboard', '/course-detail/1', '/blog'];
  const base = process.env.PREVIEW_BASE || 'http://localhost:5173';

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 900 });

  console.log('Starting trace ->', tracePath);
  await page.tracing.start({ path: tracePath, screenshots: true });

  const collected = [];
  for (const route of routes) {
    const url = base + route;
    console.log('Navigating to', url);
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const status = resp && resp.status ? resp.status() : null;
      await page.waitForTimeout(600);
      const perfEntries = await page.evaluate(() => JSON.stringify(performance.getEntries()));
      const metrics = await page.metrics();
      collected.push({ route, url, status, perfEntries: JSON.parse(perfEntries), metrics });
    } catch (e) {
      console.error('Error navigating', url, e && e.message);
      collected.push({ route, url, error: String(e) });
    }
  }

  console.log('Stopping trace');
  await page.tracing.stop();
  await browser.close();

  fs.writeFileSync(metricsPath, JSON.stringify(collected, null, 2));
  console.log('Wrote metrics to', metricsPath);
  console.log('Trace written to', tracePath);
  console.log('Profile run complete.');
}

run().catch(err => { console.error(err); process.exit(1); });
