// Start Vite with VITE_API_BASE_URL=/test-api on port 5178.
// Uses intercepted API responses; this does not verify a live backend.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href : 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(7000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const origin = process.env.FEATURE_TEST_URL ?? 'http://127.0.0.1:5178';
const now = new Date();
const month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
const date = month + '-01';
const transactions = [
  { id: 1, type: 'income', category: 'Salary', amount: 500, date, note: 'Salary fixture' },
  { id: 2, type: 'expense', category: 'Food', amount: 80, date, note: 'Food fixture' },
  { id: 3, type: 'expense', category: 'Entertainment', amount: 101, date, note: 'Cinema fixture' },
];
const budgets = [
  { id: 1, category: 'Food', month, amount: 100 },
  { id: 2, category: 'Entertainment', month, amount: 100 },
];
const reads = { transactions: 0, budgets: 0 };
let failWrite = false, failRead = false;
await page.route('**/test-api/**', async (route) => {
  const request = route.request();
  const collection = new URL(request.url()).pathname.split('/').at(-1);
  const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });
  if (request.method() === 'GET') {
    reads[collection]++;
    if (failRead) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Test server unavailable' }) });
    return reply(collection === 'transactions' ? transactions : budgets);
  }
  if (failWrite) {
    failWrite = false;
    return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Test rejection; please retry.' }) });
  }
  if (collection === 'transactions' && request.method() === 'POST') {
    const item = { ...request.postDataJSON(), id: transactions.length + 1 };
    transactions.push(item);
    return reply(item, 201);
  }
  return route.fulfill({ status: 404, body: '{}' });
});
async function noOverflow(label) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label);
}
async function navigate(label, path) {
  if (page.viewportSize().width <= 640) await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.locator('#app-sidebar').getByRole('link', { name: label, exact: true }).click();
  await page.waitForURL(origin + path);
  await page.waitForFunction((title) => document.title === title, 'Finora | ' + label);
  await page.locator('.app-sidebar--open').waitFor({ state: 'detached' });
  assert.equal(await page.locator('.app-sidebar--open').count(), 0);
  assert.equal(await page.locator('body').evaluate((element) => element.classList.contains('navigation-open')), false);
  await page.locator('main h1').waitFor();
}
async function tableScroll() {
  for (const region of await page.locator('.table-scroll').all()) {
    assert.ok(await region.evaluate((element) => {
      if (element.scrollWidth <= element.clientWidth) return true;
      element.scrollLeft = 70;
      return element.scrollLeft > 0 && ['auto', 'scroll'].includes(getComputedStyle(element).overflowX);
    }), 'table must scroll within its region');
  }
}
async function dialogFits() {
  const dialog = page.locator('dialog[open]');
  await dialog.waitFor();
  assert.ok(await dialog.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const within = box.x >= 0 && box.y >= 0 && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1;
    if (element.scrollHeight <= element.clientHeight) return within;
    element.scrollTop = 60;
    return within && element.scrollTop > 0;
  }), 'dialog must fit and scroll internally');
  await noOverflow('dialog page overflow');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
}
try {
  await mkdir('node_modules/.cache/shell-checks', { recursive: true });
  await page.goto(origin + '/transactions');
  await page.getByRole('table').waitFor();
  assert.deepEqual(reads, { transactions: 1, budgets: 1 }, 'StrictMode must fetch each collection once');
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 560 });
    if (width <= 640) {
      const opener = page.getByRole('button', { name: 'Open navigation', exact: true });
      await opener.click();
      await page.keyboard.press('Escape');
      await opener.waitFor();
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Open navigation');
      await opener.click();
      await page.locator('#app-sidebar').getByRole('button', { name: 'Close navigation' }).click();
      await opener.click();
      await page.locator('.app-scrim').click({ position: { x: width - 10, y: 20 } });
      await opener.waitFor();
    }
    for (const [label, path] of [
      ['Dashboard', '/'], ['Income', '/income'], ['Transactions', '/transactions'],
      ['Budgets', '/budgets'], ['Monthly report', '/reports/monthly'], ['About us', '/about'],
    ]) {
      await navigate(label, path);
      await noOverflow(label + ' overflow at ' + width);
      await tableScroll();
      if (label === 'Transactions') {
        await page.getByRole('button', { name: 'Add transaction', exact: true }).click();
        await page.locator('dialog[open]').screenshot({ path: 'node_modules/.cache/shell-checks/form-' + width + '.png' });
        await dialogFits();
        await page.getByRole('button', { name: /^Edit Food fixture/ }).click();
        await dialogFits();
        await page.getByRole('button', { name: /^Delete Food fixture/ }).click();
        await dialogFits();
      }
      if (label === 'Budgets') {
        await page.getByRole('button', { name: 'Edit Food budget', exact: true }).click();
        await dialogFits();
        await page.getByRole('button', { name: 'Set Transport budget', exact: true }).click();
        await dialogFits();
        await page.getByRole('button', { name: 'Remove Food budget', exact: true }).click();
        await dialogFits();
        for (const [status, token] of [['near-limit', '--color-progress-near'], ['exceeded', '--color-progress-exceeded']]) {
          const progress = page.locator('.budgets-usage progress[data-status="' + status + '"]').first();
          assert.ok(await progress.evaluate((element, name) => getComputedStyle(element).getPropertyValue('--budget-progress-color').trim() === getComputedStyle(element).getPropertyValue(name).trim(), token));
        }
      }
      if (label === 'Monthly report') await page.screenshot({ path: 'node_modules/.cache/shell-checks/report-' + width + '.png', fullPage: true });
    }
    await page.locator('.app-add-transaction').click();
    await page.waitForURL(origin + '/transactions/new');
    await page.getByLabel('Amount (USD)').waitFor();
    await noOverflow('Add transaction overflow at ' + width);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.waitForURL(origin + '/transactions');
  }
  assert.deepEqual(reads, { transactions: 1, budgets: 1 }, 'navigation must not refetch collections');
  await navigate('Income', '/income');
  await page.getByRole('link', { name: 'Add income', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Income', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.getByLabel('Amount (USD)').fill('12.34');
  await page.getByLabel('Note (optional)').fill('Shell income');
  failWrite = true;
  await page.getByRole('button', { name: 'Add transaction', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByLabel('Amount (USD)').inputValue(), '12.34');
  await page.getByRole('button', { name: 'Add transaction', exact: true }).click();
  await page.waitForURL(origin + '/transactions');
  await page.getByRole('cell', { name: 'Shell income Income', exact: true }).waitFor();
  await page.getByRole('status').filter({ hasText: 'Transaction added.' }).waitFor();
  assert.equal(await page.locator('.toast-queue').count(), 1, 'one global notification queue');
  await navigate('Monthly report', '/reports/monthly');
  assert.match(await page.locator('.report-summary').textContent(), /\$512\.34/);
  await page.reload();
  await page.getByRole('table').waitFor();
  assert.deepEqual(reads, { transactions: 2, budgets: 2 }, 'refresh must reload once per collection');
  assert.match(await page.locator('.report-summary').textContent(), /\$512\.34/);
  failRead = true;
  await page.goto(origin + '/transactions');
  await page.getByRole('alert').waitFor();
  assert.match(await page.getByRole('alert').textContent(), /The server could not complete the request/);
  failRead = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('table').waitFor();
  assert.deepEqual(reads, { transactions: 4, budgets: 3 });
  await page.goto(origin + '/unknown-route');
  await page.getByRole('heading', { name: 'We couldn’t find that page.' }).waitFor();
  await noOverflow('404 overflow');
  assert.deepEqual(errors, []);
  console.log('PASS: full shell at 360/390/768/1024/1440px; contained tables; all transaction/budget dialogs; mobile Escape/close/backdrop/route closure; required route links and Add Transaction; one startup GET per collection; no navigation refetches; failed/successful Add income, cross-page updates, refresh and retry with intercepted API.');
  console.log('LIMITATION: Dashboard and Income are reachable placeholders; their section components are still empty. Live backend behavior remains unverified.');
} finally {
  await browser.close();
}
