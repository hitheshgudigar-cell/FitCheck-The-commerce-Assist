import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import os from 'os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function clickButtonWithText(page, text) {
  return await page.evaluate((targetText) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes(targetText));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, text);
}

async function typeAndSubmit(page, text) {
  await page.evaluate(() => {
    const ta = document.getElementById('fitcheck-chat-composer');
    if (ta) ta.value = '';
  });
  await page.type('#fitcheck-chat-composer', text);
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[aria-label="Send query"]');
    if (submitBtn) submitBtn.click();
  });
}

async function scrollToCard(page) {
  await page.evaluate(() => {
    const card =
      document.querySelector('[data-testid="answer-card"]') ||
      document.querySelector('[data-testid="clarify-card"]') ||
      document.querySelector('article');
    if (card) {
      card.scrollIntoView({ block: 'start', behavior: 'instant' });
      window.scrollBy(0, -70); // offset header
    }
  });
}

async function run() {
  const profileDir = path.join(os.tmpdir(), 'fc_prof_' + Date.now());
  console.log('Launching browser with puppeteer-core at:', profileDir);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    userDataDir: profileDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const setDesktop = async () => page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  const setMobile = async () => page.setViewport({ width: 375, height: 820, deviceScaleFactor: 2 });

  // 0. Initial Discovery Home
  console.log('Capturing Hero / Discovery Home...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await setDesktop();
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_discovery_hero_desktop_1280px.png') });
  await setMobile();
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_discovery_hero_mobile_375px.png') });

  // 1. Scenario 1: Dress "bust 36, waist 30, will the M fit?"
  console.log('Running Scenario 1: Dress...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await setDesktop();
  await clickButtonWithText(page, 'Ask about a product');
  await new Promise(r => setTimeout(r, 500));
  await clickButtonWithText(page, 'bust 36, waist 30');
  await new Promise(r => setTimeout(r, 1800));
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_1_dress_desktop_1280px.png') });
  await setMobile();
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_1_dress_mobile_375px.png') });

  // 2. Scenario 2: HP Cartridge
  console.log('Running Scenario 2: HP Cartridge...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await setDesktop();
  await clickButtonWithText(page, 'Ask about a product');
  await new Promise(r => setTimeout(r, 400));
  await page.select('#product-select', 'prod_elec_cartridge_01');
  await new Promise(r => setTimeout(r, 500));
  await clickButtonWithText(page, 'HP DeskJet 2331');
  await new Promise(r => setTimeout(r, 1800));
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_2_hp_cartridge_desktop_1280px.png') });
  await setMobile();
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_2_hp_cartridge_mobile_375px.png') });

  // 3. Scenario 3: TV Mount wrong VESA
  console.log('Running Scenario 3: TV Mount...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await setDesktop();
  await clickButtonWithText(page, 'Ask about a product');
  await new Promise(r => setTimeout(r, 400));
  await page.select('#product-select', 'prod_elec_tv_mount_01');
  await new Promise(r => setTimeout(r, 500));
  await clickButtonWithText(page, '75 inch TV');
  await new Promise(r => setTimeout(r, 1800));
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_3_tv_mount_desktop_1280px.png') });
  await setMobile();
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_3_tv_mount_mobile_375px.png') });

  // 4. Scenario 4: Sofa
  console.log('Running Scenario 4: Sofa...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await setDesktop();
  await clickButtonWithText(page, 'Ask about a product');
  await new Promise(r => setTimeout(r, 400));
  await page.select('#product-select', 'prod_furniture_01');
  await new Promise(r => setTimeout(r, 500));
  await clickButtonWithText(page, '80 cm door');
  await new Promise(r => setTimeout(r, 1800));
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_4_sofa_desktop_1280px.png') });
  await setMobile();
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_4_sofa_mobile_375px.png') });

  // 5. Scenario 5: Vacuum Filter ClarifyCard
  console.log('Running Scenario 5: Vacuum Filter...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await setDesktop();
  await clickButtonWithText(page, 'Ask about a product');
  await new Promise(r => setTimeout(r, 400));
  await page.select('#product-select', 'prod_elec_filter_01');
  await new Promise(r => setTimeout(r, 500));
  await clickButtonWithText(page, 'Does this filter fit my vacuum?');
  await new Promise(r => setTimeout(r, 1800));
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_5_vacuum_clarify_desktop_1280px.png') });
  await setMobile();
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_5_vacuum_clarify_mobile_375px.png') });

  // 6. Scenario 6: Discovery "black dress size M near me today"
  console.log('Running Scenario 6: Discovery Black Dress...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await setDesktop();
  await clickButtonWithText(page, 'Black dress, size M');
  await new Promise(r => setTimeout(r, 1800));
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_6_discovery_results_desktop_1280px.png') });
  await setMobile();
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_6_discovery_results_mobile_375px.png') });

  // 7. Scenario 7: Pharmacy item
  console.log('Running Scenario 7: Pharmacy...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await setDesktop();
  await clickButtonWithText(page, 'Ask about a product');
  await new Promise(r => setTimeout(r, 400));
  await page.select('#product-select', 'prod_pharm_paracetamol');
  await new Promise(r => setTimeout(r, 500));
  await clickButtonWithText(page, 'gluten-free pain reliever');
  await new Promise(r => setTimeout(r, 1800));
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_7_pharmacy_desktop_1280px.png') });
  await setMobile();
  await scrollToCard(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scenario_7_pharmacy_mobile_375px.png') });

  // 8. Citation Sheet Modal
  console.log('Capturing Citation Sheet Modal...');
  await setDesktop();
  const chip = await page.evaluate(() => {
    const btn = document.querySelector('button[title*="citation excerpt"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (chip) {
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'citation_sheet_modal_desktop_1280px.png') });
    await clickButtonWithText(page, 'Done');
  }

  // 9. Reserve for Pickup Modal
  console.log('Capturing Reserve for Pickup Modal...');
  const reserveBtn = await clickButtonWithText(page, 'Reserve for pickup');
  if (reserveBtn) {
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'reserve_pickup_modal_desktop_1280px.png') });
    await clickButtonWithText(page, 'Confirm Free Reservation');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'reserve_pickup_confirmed_desktop_1280px.png') });
    await clickButtonWithText(page, 'Done');
  }

  console.log('All screenshots refreshed and generated cleanly!');
  await browser.close();
}

run().catch(err => {
  console.error('Error running screenshot capture:', err);
  process.exit(1);
});
