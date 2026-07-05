const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('file:///home/user/jaff7787dev/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForTimeout(300);

  // Day 1: answer 3 questions (2 correct, 1 wrong), then quit mid-session
  await page.locator('.day-cell').first().click();
  await page.waitForTimeout(300);
  for (let k = 0; k < 3; k++) {
    const ci = await page.evaluate(() => S.questions[S.idx].ci);
    await page.locator('.choice').nth(k === 2 ? (ci + 1) % 4 : ci).click();
    await page.waitForTimeout(k === 2 ? 1800 : 1100);
  }
  const scoreBefore = await page.evaluate(() => S.score);
  await page.locator('#btn-quit').click();
  await page.waitForTimeout(300);

  // resume banner visible?
  console.log('1. resume banner:', await page.locator('#btn-resume.show').count() === 1);
  console.log('   banner text:', (await page.locator('#resume-title').textContent()).trim());

  // simulate full app restart (reload) — banner must survive
  await page.reload(); await page.waitForTimeout(400);
  console.log('2. banner after reload:', await page.locator('#btn-resume.show').count() === 1);

  // resume via banner
  await page.locator('#btn-resume').click();
  await page.waitForTimeout(300);
  const st = await page.evaluate(() => ({ idx: S.idx, score: S.score, correct: S.correct, wrong: S.wrongQs.length, count: document.getElementById('p-count').textContent }));
  console.log('3. resumed at:', JSON.stringify(st), 'score preserved:', st.score === scoreBefore);
  await page.screenshot({ path: 'shot3-resume.png' });

  // quit again, tap Day 1 cell directly → should also resume (not restart)
  await page.locator('#btn-quit').click(); await page.waitForTimeout(250);
  await page.locator('.day-cell').first().click(); await page.waitForTimeout(250);
  console.log('4. day-cell resume idx:', await page.evaluate(() => S.idx), '(expect 3)');

  // discard via X → banner gone, day cell starts fresh
  await page.locator('#btn-quit').click(); await page.waitForTimeout(250);
  await page.locator('#btn-resume-x').click(); await page.waitForTimeout(200);
  console.log('5. banner after discard:', await page.locator('#btn-resume.show').count() === 0);
  await page.locator('.day-cell').first().click(); await page.waitForTimeout(250);
  console.log('   fresh start idx:', await page.evaluate(() => S.idx), '(expect 0)');

  // finish a short session to test history: shrink question list
  await page.evaluate(() => { S.questions = S.questions.slice(0, 2); renderQuestion(); });
  for (let k = 0; k < 2; k++) {
    const ci = await page.evaluate(() => S.questions[S.idx].ci);
    await page.locator('.choice').nth(ci).click();
    await page.waitForTimeout(1100);
  }
  console.log('6. result shown:', await page.locator('#screen-result.active').count() === 1);
  const hist = await page.evaluate(() => store.hist);
  console.log('   history entries:', hist.length, JSON.stringify(hist[0], (k,v)=>k==='t'?'<t>':v));
  console.log('   session cleared:', await page.evaluate(() => localStorage.getItem('vocaQuest.session') === null));

  // history screen
  await page.locator('#btn-home').click(); await page.waitForTimeout(250);
  console.log('7. streak line:', (await page.locator('#home-streak').textContent()).trim());
  await page.locator('#btn-hist').click(); await page.waitForTimeout(250);
  console.log('   hist stats:', await page.locator('#h-streak').textContent(),
              await page.locator('#h-sessions').textContent(),
              await page.locator('#h-quest').textContent(),
              await page.locator('#h-avg').textContent());
  console.log('   hist items:', await page.locator('.hist-item').count());
  await page.screenshot({ path: 'shot3-hist.png' });
  await page.locator('#btn-hist-back').click(); await page.waitForTimeout(200);
  await page.screenshot({ path: 'shot3-home.png' });

  console.log('ERRORS:', errors.length ? errors : 'none');
  await browser.close();
})().catch(e => { console.error('TEST FAIL', e); process.exit(1); });
