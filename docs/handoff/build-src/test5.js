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

  // cleanMeaning sanity
  const cm = await page.evaluate(() => [
    cleanMeaning('v. 가정하다, 추정하다; (역할·임무 등을) (떠)맡다'),
    cleanMeaning('a. (병에) 걸리기 쉬운, 취약한 영향받기 쉬운, 민감한'),
    cleanMeaning('v. 보존[보호]하다, 아끼다'),
    cleanMeaning('-을 닮다'),
  ]);
  console.log('cleanMeaning:', JSON.stringify(cm, null, 0));

  // headless chromium has speechSynthesis but no voices; game must still advance via minDelay+cap
  await page.locator('.day-cell').first().click();
  await page.waitForTimeout(400);
  const t0 = Date.now();
  const ci = await page.evaluate(() => S.questions[S.idx].ci);
  await page.locator('.choice').nth(ci).click();
  // wait until next question renders (idx becomes 1)
  await page.waitForFunction(() => S && S.idx === 1, null, { timeout: 9000 });
  console.log('advanced to next question after', Date.now() - t0, 'ms');

  // wrong answer also advances
  const t1 = Date.now();
  const ci2 = await page.evaluate(() => S.questions[S.idx].ci);
  await page.locator('.choice').nth((ci2 + 1) % 4).click();
  await page.waitForFunction(() => S && S.idx === 2, null, { timeout: 9000 });
  console.log('advanced after wrong in', Date.now() - t1, 'ms');

  // quit during the post-answer wait must NOT advance / show result
  const ci3 = await page.evaluate(() => S.questions[S.idx].ci);
  await page.locator('.choice').nth(ci3).click();
  await page.waitForTimeout(200);
  await page.locator('#btn-quit').click();
  await page.waitForTimeout(2500);
  console.log('still on home:', await page.locator('#screen-home.active').count() === 1,
              '| S nulled:', await page.evaluate(() => S === null));
  console.log('resume banner shows next idx:', (await page.locator('#resume-title').textContent()).trim());

  console.log('ERRORS:', errors.length ? errors : 'none');
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
