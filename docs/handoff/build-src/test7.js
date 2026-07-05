const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file:///home/user/jaff7787dev/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForTimeout(300);
  await page.locator('#btn-start').click({ force: true });
  await page.waitForTimeout(400);
  await page.locator('.stage.current').click({ force: true });
  await page.waitForTimeout(300);

  console.log('tiers:', await page.evaluate(() => [2,3,4,5,9,10,15,17,20].map(c => c + ':' + comboTierOf(c)).join(' ')));

  // answer correctly repeatedly, capture milestone states at combo 3, 5, 10
  for (let n = 1; n <= 10; n++) {
    const ci = await page.evaluate(() => S.questions[S.idx].ci);
    await page.locator('.choice').nth(ci).click();
    await page.waitForTimeout(350);
    if (n === 3) {
      console.log('combo3: blast visible:', await page.locator('.combo-blast.t1').count() === 1,
                  '| chip:', (await page.locator('#combo-chip').textContent()).trim(),
                  '| chip class:', await page.locator('#combo-chip').getAttribute('class'));
      await page.screenshot({ path: 'shot7-c3.png' });
    }
    if (n === 5) {
      console.log('combo5: blast t2:', await page.locator('.combo-blast.t2').count() === 1,
                  '| chip:', (await page.locator('#combo-chip').textContent()).trim());
      await page.screenshot({ path: 'shot7-c5.png' });
    }
    if (n === 10) {
      console.log('combo10: blast t3:', await page.locator('.combo-blast.t3').count() === 1,
                  '| chip:', (await page.locator('#combo-chip').textContent()).trim());
      await page.screenshot({ path: 'shot7-c10.png' });
    }
    await page.waitForFunction(i => S && S.idx === i, n, { timeout: 12000 });
  }
  console.log('progressed through 10 questions, score:', await page.evaluate(() => S.score));
  console.log('ERRORS:', errors.length ? errors : 'none');
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
