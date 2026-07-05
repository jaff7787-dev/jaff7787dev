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

  await page.locator('.day-cell').first().click();
  await page.waitForTimeout(400);
  // shrink to 3 questions for a fast full run
  await page.evaluate(() => { S.questions = S.questions.slice(0, 3); renderQuestion(); });

  // Q1: wrong on purpose → sheet must appear, NO auto-advance
  const w1 = await page.evaluate(() => S.questions[S.idx].w);
  const ci = await page.evaluate(() => S.questions[S.idx].ci);
  await page.locator('.choice').nth((ci + 1) % 4).click();
  await page.waitForTimeout(900);
  console.log('1. sheet shown:', await page.locator('#answer-sheet.show').count() === 1);
  console.log('   sheet word:', await page.locator('#sheet-word').textContent());
  console.log('   re-queued:', await page.evaluate(() => S.questions.length), '(expect 4)');
  await page.screenshot({ path: 'shot6-sheet.png' });
  // still on same question after 3s (no auto-advance)
  await page.waitForTimeout(2500);
  console.log('2. no auto-advance, idx still 0:', await page.evaluate(() => S.idx) === 0);

  // tap continue → next question
  await page.locator('#sheet-continue').click();
  await page.waitForTimeout(300);
  console.log('3. advanced to idx 1:', await page.evaluate(() => S.idx) === 1,
              '| sheet hidden:', await page.locator('#answer-sheet.show').count() === 0);

  // Q2, Q3 correct
  for (let k = 0; k < 2; k++) {
    const c = await page.evaluate(() => S.questions[S.idx].ci);
    await page.locator('.choice').nth(c).click();
    await page.waitForFunction(i => S && S.idx === i, k + 2, { timeout: 9000 });
  }
  // Q4 = re-ask of Q1
  const tag = await page.locator('#wc-tag').textContent();
  const w4 = await page.evaluate(() => S.questions[S.idx].w);
  console.log('4. re-ask appears last:', w4 === w1, '| tag:', tag);
  await page.screenshot({ path: 'shot6-reask.png' });
  const scoreBefore = await page.evaluate(() => S.score);
  const c4 = await page.evaluate(() => S.questions[S.idx].ci);
  await page.locator('.choice').nth(c4).click();
  await page.waitForFunction(() => document.getElementById('screen-result').classList.contains('active'), null, { timeout: 9000 });
  const gain = await page.evaluate(() => S.score) - scoreBefore;
  console.log('5. re-ask gain:', gain, '(expect 5)');
  console.log('   result stats:', await page.locator('#result-msg').textContent(),
              '|', (await page.locator('#r-correct').textContent()).trim());
  console.log('ERRORS:', errors.length ? errors : 'none');
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
