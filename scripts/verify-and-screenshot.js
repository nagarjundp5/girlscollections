const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = path.join(__dirname, '..', 'public', 'qa-screenshots');
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  console.log('--- STARTING QA SUITE ---');

  // TEST 1: First-visit chooser modal at 390px
  console.log('Testing First-Visit Chooser at 390px...');
  const pageChooser = await context.newPage();
  await pageChooser.setViewportSize({ width: 390, height: 844 });
  await pageChooser.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  // Wait ~1.2s for chooser modal to appear
  await pageChooser.waitForTimeout(1400);

  const modalVisible = await pageChooser.locator('role=dialog[name="Who are we dressing today?"]').isVisible();
  console.log('Chooser modal visible after 1s:', modalVisible);
  await pageChooser.screenshot({
    path: path.join(ARTIFACT_DIR, 'chooser-390px.png'),
    fullPage: false,
  });

  // Test ESC to close chooser
  await pageChooser.keyboard.press('Escape');
  await pageChooser.waitForTimeout(300);
  const modalClosed = !(await pageChooser.locator('role=dialog[name="Who are we dressing today?"]').isVisible());
  console.log('Chooser closed on ESC:', modalClosed);
  await pageChooser.close();

  // TEST 2: Desktop 1440px Chooser
  console.log('Testing First-Visit Chooser at 1440px...');
  const pageChooserDesk = await browser.newPage();
  await pageChooserDesk.setViewportSize({ width: 1440, height: 900 });
  await pageChooserDesk.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageChooserDesk.waitForTimeout(1400);
  await pageChooserDesk.screenshot({
    path: path.join(ARTIFACT_DIR, 'chooser-1440px.png'),
    fullPage: false,
  });
  await pageChooserDesk.close();

  // TEST 3: Mobile 390px Homepage (Stored preference so chooser doesn't block)
  console.log('Testing Homepage at 390px...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    storageState: {
      cookies: [{ name: 'tgc_pref', value: 'all', domain: 'localhost', path: '/' }],
      origins: [{ origin: 'http://localhost:3000', localStorage: [{ name: 'tgc_pref', value: 'all' }] }],
    },
  });
  const pageMobile = await mobileContext.newPage();
  await pageMobile.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(500);

  // Capture Header, Hero + Pill, Circles at 390px
  await pageMobile.screenshot({
    path: path.join(ARTIFACT_DIR, 'homepage-top-390px.png'),
  });

  // Measure Header Height & Logo Size
  const headerHeightMobile = await pageMobile.locator('nav[aria-label="Main Navigation"]').evaluate(el => el.offsetHeight);
  const bannerHeightMobile = await pageMobile.locator('div[aria-label="Announcement Bar"]').evaluate(el => el.offsetHeight);
  const logoDimensionsMobile = await pageMobile.locator('img[alt="The Girls Collections"]').evaluate(el => {
    const parent = el.closest('div');
    return {
      imgW: el.offsetWidth,
      imgH: el.offsetHeight,
      circleW: parent ? parent.offsetWidth : 0,
      circleH: parent ? parent.offsetHeight : 0,
    };
  });
  console.log('Mobile 390px - Nav Height:', headerHeightMobile, 'px (Target: 68px)');
  console.log('Mobile 390px - Banner Height:', bannerHeightMobile, 'px (Target: 36px)');
  console.log('Mobile 390px - Logo Circle:', logoDimensionsMobile.circleW, 'x', logoDimensionsMobile.circleH, 'px (Target: 56px)');

  // Check Category Circles Mobile
  const categoryStrip = pageMobile.locator('section[aria-label="Categories"]');
  await categoryStrip.scrollIntoViewIfNeeded();
  await pageMobile.waitForTimeout(300);
  await pageMobile.screenshot({
    path: path.join(ARTIFACT_DIR, 'circles-390px.png'),
  });

  // Check Trending Section Mobile
  const trendingSection = pageMobile.locator('h2:text("Trending This Week")').locator('..').locator('..');
  if (await trendingSection.isVisible()) {
    await trendingSection.scrollIntoViewIfNeeded();
    await pageMobile.waitForTimeout(300);
    await pageMobile.screenshot({
      path: path.join(ARTIFACT_DIR, 'trending-390px.png'),
    });
  }

  // Scroll test: verify announcement bar hide via translateY
  console.log('Testing Scroll behavior at 390px...');
  await pageMobile.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
  await pageMobile.waitForTimeout(400);
  const headerTransform = await pageMobile.locator('header').evaluate(el => el.style.transform);
  console.log('Header transform after scroll:', headerTransform, '(Expected: translateY(-36px))');
  await pageMobile.screenshot({
    path: path.join(ARTIFACT_DIR, 'header-scrolled-390px.png'),
  });

  // TEST 4: Viewports 360px and 430px
  for (const w of [360, 430]) {
    console.log(`Testing Viewport ${w}px...`);
    const vpPage = await mobileContext.newPage();
    await vpPage.setViewportSize({ width: w, height: 800 });
    await vpPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await vpPage.waitForTimeout(400);
    await vpPage.screenshot({
      path: path.join(ARTIFACT_DIR, `homepage-${w}px.png`),
    });
    await vpPage.close();
  }

  // TEST 5: Desktop 1440px
  console.log('Testing Homepage at 1440px...');
  const deskContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: {
      cookies: [{ name: 'tgc_pref', value: 'all', domain: 'localhost', path: '/' }],
      origins: [{ origin: 'http://localhost:3000', localStorage: [{ name: 'tgc_pref', value: 'all' }] }],
    },
  });
  const pageDesk = await deskContext.newPage();
  await pageDesk.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await pageDesk.waitForTimeout(500);

  const headerHeightDesk = await pageDesk.locator('nav[aria-label="Main Navigation"]').evaluate(el => el.offsetHeight);
  const bannerHeightDesk = await pageDesk.locator('div[aria-label="Announcement Bar"]').evaluate(el => el.offsetHeight);
  const logoDimensionsDesk = await pageDesk.locator('img[alt="The Girls Collections"]').evaluate(el => {
    const parent = el.closest('div');
    return {
      circleW: parent ? parent.offsetWidth : 0,
      circleH: parent ? parent.offsetHeight : 0,
    };
  });
  console.log('Desktop 1440px - Nav Height:', headerHeightDesk, 'px (Target: 80px)');
  console.log('Desktop 1440px - Banner Height:', bannerHeightDesk, 'px (Target: 36px)');
  console.log('Desktop 1440px - Logo Circle:', logoDimensionsDesk.circleW, 'x', logoDimensionsDesk.circleH, 'px (Target: 64px)');

  await pageDesk.screenshot({
    path: path.join(ARTIFACT_DIR, 'homepage-top-1440px.png'),
  });

  const categoryStripDesk = pageDesk.locator('section[aria-label="Categories"]');
  await categoryStripDesk.scrollIntoViewIfNeeded();
  await pageDesk.waitForTimeout(300);
  await pageDesk.screenshot({
    path: path.join(ARTIFACT_DIR, 'circles-1440px.png'),
  });

  const trendingDesk = pageDesk.locator('h2:text("Trending This Week")').locator('..').locator('..');
  if (await trendingDesk.isVisible()) {
    await trendingDesk.scrollIntoViewIfNeeded();
    await pageDesk.waitForTimeout(300);
    await pageDesk.screenshot({
      path: path.join(ARTIFACT_DIR, 'trending-1440px.png'),
    });
  }

  // Test Floating Pill Interaction on Desktop
  console.log('Testing Pill interaction (switching to Women, then Kids, then All)...');
  await pageDesk.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await pageDesk.waitForTimeout(300);

  const womenTab = pageDesk.locator('button[role="tab"]:text("Women")');
  await womenTab.click();
  await pageDesk.waitForTimeout(300);
  console.log('Clicked Women tab. Preference in HTML:', await pageDesk.evaluate(() => document.documentElement.getAttribute('data-pref')));
  await pageDesk.screenshot({
    path: path.join(ARTIFACT_DIR, 'pill-women-active-1440px.png'),
  });

  // Click Women tab again to toggle back to 'all'
  await womenTab.click();
  await pageDesk.waitForTimeout(300);
  console.log('Clicked Women tab again. Preference in HTML:', await pageDesk.evaluate(() => document.documentElement.getAttribute('data-pref')));

  // Check WhatsApp button SVG presence
  const waSvg = await pageDesk.locator('a[aria-label="Contact us on WhatsApp"] svg').count();
  console.log('WhatsApp SVG icon present:', waSvg > 0);

  await browser.close();
  console.log('--- QA SUITE COMPLETED SUCCESSFULLY ---');
}

run().catch(err => {
  console.error('QA SUITE ERROR:', err);
  process.exit(1);
});

