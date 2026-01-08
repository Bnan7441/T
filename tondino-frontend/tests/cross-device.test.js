import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer from 'puppeteer';

describe('cross-device sanity', () => {
  it('runs a trivial test', () => {
    // sanity placeholder for existing test harness
    expect(true).toBe(true);
  });
});

describe('Cross-Device E2E Tests', () => {
  // Skip E2E tests if not in CI environment or if explicitly disabled
  const skipE2E = process.env.SKIP_E2E === 'true' || (!process.env.CI && !process.env.RUN_E2E);
  const describeIf = skipE2E ? describe.skip : describe;

  describeIf('Device Responsiveness', () => {
    let browser, pages;

    beforeAll(async () => {
      if (skipE2E) return;
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Create pages for each device
      pages = {};
      for (const [key, device] of Object.entries(devices)) {
        const page = await browser.newPage();
        await page.setViewport(device.viewport);
        await page.setUserAgent(device.userAgent);
        pages[key] = page;
      }
    });

    afterAll(async () => {
      if (browser) await browser.close();
    });

    it('should load homepage on all devices', async () => {
      const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
      
      for (const [deviceName, page] of Object.entries(pages)) {
        await page.goto(baseUrl, { waitUntil: 'networkidle0' });
        
        // Check if page loaded successfully
        const title = await page.title();
        expect(title).toContain('Tondino');
        
        // Check for main navigation elements
        const nav = await page.$('[data-testid="main-navigation"]');
        expect(nav).toBeTruthy();
        
        // Log device test completion
        console.log(`✓ Homepage loaded successfully on ${deviceName}`);
      }
    });

    it('should handle navigation on all devices', async () => {
      for (const [deviceName, page] of Object.entries(pages)) {
        // Test navigation to courses page
        await page.click('[data-testid="courses-link"]');
        await page.waitForSelector('[data-testid="courses-grid"]', { timeout: 5000 });
        
        const coursesGrid = await page.$('[data-testid="courses-grid"]');
        expect(coursesGrid).toBeTruthy();
        
        console.log(`✓ Course navigation works on ${deviceName}`);
      }
    });

    it('should display responsive layout', async () => {
      for (const [deviceName, page] of Object.entries(pages)) {
        const device = devices[Object.keys(devices).find(key => pages[key] === page)];
        
        // Check mobile menu on smaller screens
        if (device.viewport.width < 768) {
          const mobileMenu = await page.$('[data-testid="mobile-menu-button"]');
          expect(mobileMenu).toBeTruthy();
        } else {
          const desktopNav = await page.$('[data-testid="desktop-navigation"]');
          expect(desktopNav).toBeTruthy();
        }
        
        console.log(`✓ Responsive layout correct on ${deviceName}`);
      }
    });

    it('should handle form interactions', async () => {
      for (const [deviceName, page] of Object.entries(pages)) {
        // Navigate to login form
        await page.goto(`${process.env.TEST_URL || 'http://localhost:3000'}/login`);
        await page.waitForSelector('[data-testid="login-form"]');
        
        // Test form input
        await page.type('[data-testid="email-input"]', 'test@example.com');
        await page.type('[data-testid="password-input"]', 'testpassword');
        
        const emailValue = await page.$eval('[data-testid="email-input"]', el => el.value);
        expect(emailValue).toBe('test@example.com');
        
        console.log(`✓ Form inputs work on ${deviceName}`);
      }
    });
  });

  describeIf('Performance Tests', () => {
    let browser, page;

    beforeAll(async () => {
      if (skipE2E) return;
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      page = await browser.newPage();
    });

    afterAll(async () => {
      if (browser) await browser.close();
    });

    it('should load within acceptable time limits', async () => {
      const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
      
      const startTime = Date.now();
      await page.goto(baseUrl, { waitUntil: 'load' });
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      console.log(`✓ Page loaded in ${loadTime}ms`);
    });

    it('should have acceptable performance metrics', async () => {
      await page.goto(process.env.TEST_URL || 'http://localhost:3000');
      
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          timeToFirstByte: navigation.responseStart - navigation.requestStart
        };
      });
      
      expect(performanceMetrics.loadComplete).toBeLessThan(3000);
      expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
      expect(performanceMetrics.timeToFirstByte).toBeLessThan(1000);
      
      console.log('✓ Performance metrics within acceptable range', performanceMetrics);
    });
  });
});
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cross-Device Testing Suite for Tondino Frontend
 *
 * Tests layout, responsiveness, and functionality across multiple device sizes:
 * - iPhone SE (375x667)
 * - iPad (768x1024)
 * - Standard Laptop (1366x768)
 * - Large Desktop (1920x1080+)
 */

// Device configurations
const devices = {
  iphoneSE: {
    name: 'iPhone SE',
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
  },
  ipad: {
    name: 'iPad',
    viewport: { width: 768, height: 1024 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
  },
  laptop: {
    name: 'Standard Laptop',
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  desktop: {
    name: 'Large Desktop',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

// Test pages to check
const testPages = [
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'Club', path: '/club' },
  { name: 'About', path: '/about' },
  { name: 'Blog', path: '/blog' }
];

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  devices: {},
  issues: []
};

/**
 * Initialize test results structure
 */
function initializeResults() {
  Object.keys(devices).forEach(deviceKey => {
    testResults.devices[deviceKey] = {
      name: devices[deviceKey].name,
      pages: {}
    };
  });
}

/**
 * Take screenshot of current page
 */
async function takeScreenshot(page, deviceKey, pageName, suffix = '') {
  const screenshotDir = path.join(__dirname, '..', 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const filename = `${deviceKey}-${pageName}${suffix ? '-' + suffix : ''}.png`;
  const filepath = path.join(screenshotDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true
  });

  return filepath;
}

/**
 * Check for layout issues
 */
async function checkLayoutIssues(page, deviceKey, pageName) {
  const issues = [];

  try {
    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    if (hasHorizontalScroll) {
      issues.push('Horizontal scroll detected - content overflows viewport width');
    }

    // Check for very small text (less than 12px)
    const smallTextElements = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        return fontSize > 0 && fontSize < 12 && el.textContent.trim().length > 0;
      }).length;
    });

    if (smallTextElements > 0) {
      issues.push(`${smallTextElements} elements have very small text (< 12px)`);
    }

    // Check for images without proper sizing
    const unsizedImages = await page.$$eval('img', images => {
      return images.filter(img => {
        const style = window.getComputedStyle(img);
        return !style.width || style.width === 'auto' || !style.height || style.height === 'auto';
      }).length;
    });

    if (unsizedImages > 0) {
      issues.push(`${unsizedImages} images may not be properly sized`);
    }

    // Check navigation visibility
    const navVisible = await page.evaluate(() => {
      const header = document.querySelector('header');
      const bottomNav = document.querySelector('[class*="mobile-nav"]') || document.querySelector('[class*="bottom-nav"]');
      return {
        header: header ? header.offsetHeight > 0 : false,
        bottomNav: bottomNav ? bottomNav.offsetHeight > 0 : false
      };
    });

    if (!navVisible.header && !navVisible.bottomNav) {
      issues.push('No navigation elements visible');
    }

    // Check touch target sizes on mobile/tablet
    if (deviceKey === 'iphoneSE' || deviceKey === 'ipad') {
      const smallTouchTargets = await page.$$eval('button, a, [role="button"]', elements => {
        return elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        }).length;
      });

      if (smallTouchTargets > 0) {
        issues.push(`${smallTouchTargets} touch targets are smaller than 44px (accessibility guideline)`);
      }
    }

  } catch (error) {
    issues.push(`Error checking layout: ${error.message}`);
  }

  return issues;
}

/**
 * Test a specific page on a specific device
 */
async function testPageOnDevice(browser, deviceKey, pageInfo) {
  const device = devices[deviceKey];
  const page = await browser.newPage();

  try {
    // Set viewport and user agent
    await page.setViewport(device.viewport);
    await page.setUserAgent(device.userAgent);

    // Navigate to page
    const url = `http://localhost:3000${pageInfo.path}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Take screenshot
    const screenshotPath = await takeScreenshot(page, deviceKey, pageInfo.name);

    // Check for layout issues
    const issues = await checkLayoutIssues(page, deviceKey, pageInfo.name);

    // Store results
    testResults.devices[deviceKey].pages[pageInfo.name] = {
      url,
      screenshot: screenshotPath,
      issues,
      status: issues.length === 0 ? 'PASS' : 'ISSUES'
    };

    // Add issues to global issues array
    issues.forEach(issue => {
      testResults.issues.push({
        device: device.name,
        page: pageInfo.name,
        issue
      });
    });

    console.log(`✓ Tested ${pageInfo.name} on ${device.name} - ${issues.length === 0 ? 'PASS' : `${issues.length} issues found`}`);

  } catch (error) {
    console.error(`✗ Failed to test ${pageInfo.name} on ${device.name}: ${error.message}`);
    testResults.devices[deviceKey].pages[pageInfo.name] = {
      url: `http://localhost:3000${pageInfo.path}`,
      error: error.message,
      status: 'ERROR'
    };
  } finally {
    await page.close();
  }
}

/**
 * Run cross-device tests
 */
async function runCrossDeviceTests() {
  console.log('🚀 Starting Cross-Device Testing Suite for Tondino Frontend');
  console.log('=' .repeat(60));

  initializeResults();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Test each device
    for (const deviceKey of Object.keys(devices)) {
      console.log(`\n📱 Testing on ${devices[deviceKey].name} (${devices[deviceKey].viewport.width}x${devices[deviceKey].viewport.height})`);
      console.log('-'.repeat(40));

      // Test each page
      for (const pageInfo of testPages) {
        await testPageOnDevice(browser, deviceKey, pageInfo);
      }
    }

  } finally {
    await browser.close();
  }

  // Generate report
  generateReport();

  console.log('\n✅ Cross-device testing completed!');
  console.log('📊 Results saved to test-results.json');
  console.log('📸 Screenshots saved to test-screenshots/');
}

/**
 * Generate test report
 */
function generateReport() {
  const reportPath = path.join(__dirname, '..', 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

  // Generate summary
  const summary = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalIssues: testResults.issues.length,
    deviceSummary: {}
  };

  Object.keys(testResults.devices).forEach(deviceKey => {
    const device = testResults.devices[deviceKey];
    const deviceTests = Object.keys(device.pages).length;
    const devicePasses = Object.values(device.pages).filter(p => p.status === 'PASS').length;
    const deviceIssues = Object.values(device.pages).reduce((sum, p) => sum + (p.issues ? p.issues.length : 0), 0);

    summary.totalTests += deviceTests;
    summary.passedTests += devicePasses;
    summary.failedTests += deviceTests - devicePasses;
    summary.deviceSummary[device.name] = {
      tests: deviceTests,
      passes: devicePasses,
      issues: deviceIssues
    };
  });

  const summaryPath = path.join(__dirname, '..', 'test-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log('\n📈 Test Summary:');
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed: ${summary.passedTests}`);
  console.log(`Failed: ${summary.failedTests}`);
  console.log(`Total Issues: ${summary.totalIssues}`);

  console.log('\n📋 Device Summary:');
  Object.entries(summary.deviceSummary).forEach(([device, stats]) => {
    console.log(`${device}: ${stats.passes}/${stats.tests} passed, ${stats.issues} issues`);
  });
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCrossDeviceTests().catch(console.error);
}

export { runCrossDeviceTests, devices, testPages };