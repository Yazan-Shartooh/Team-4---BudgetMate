// Run against the isolated Vite fixture with VITE_API_BASE_URL=/test-api.
// PLAYWRIGHT_MODULE_PATH may point to an existing playwright/index.mjs.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href : 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(7000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const now = new Date();
const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const date = `${month}-01`;
let transactions = [
  { id: 1, type: 'income', category: 'Salary', amount: 500, date, note: 'Salary fixture' },
  { id: 2, type: 'expense', category: 'Food', amount: 80, date, note: 'Food fixture' },
  { id: 3, type: 'expense', category: 'Transport', amount: 20, date, note: 'Transport fixture' },
  { id: 4, type: 'expense', category: 'Entertainment', amount: 101, date, note: 'Entertainment fixture' },
];
let budgets = [
  { id: 1, category: 'Food', month, amount: 100 },
  { id: 2, category: 'Transport', month, amount: 100 },
  { id: 3, category: 'Entertainment', month, amount: 100 },
];
let nextTransaction = 5, nextBudget = 4, writes = 0, failNext = false;
await page.route('**/test-api/**', async (route) => {
  const request = route.request();
  const path = new URL(request.url()).pathname.replace('/test-api', '');
  const method = request.method();
  const input = request.postDataJSON();
  const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });
  if (method !== 'GET') {
    writes++;
    // Exercise pending UI and Escape protection while the response is outstanding.
    await new Promise((resolve) => setTimeout(resolve, 120));
    if (failNext) {
      failNext = false;
      return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Fixture server rejected this change. Try again.' }) });
    }
  }
  if (path === '/transactions' && method === 'GET') return reply(transactions);
  if (path === '/budgets' && method === 'GET') return reply(budgets);
  if (path === '/transactions' && method === 'POST') {
    const item = { ...input, id: nextTransaction++ }; transactions.push(item); return reply(item, 201);
  }
  if (path.startsWith('/transactions/') && method === 'PUT') {
    const id = Number(path.split('/').at(-1));
    const item = { ...input, id }; transactions = transactions.map((row) => row.id === id ? item : row); return reply(item);
  }
  if (path.startsWith('/transactions/') && method === 'DELETE') {
    const id = Number(path.split('/').at(-1)); transactions = transactions.filter((row) => row.id !== id); return reply(id);
  }
  if (path === '/budgets' && method === 'PUT') {
    const existing = budgets.find((row) => row.category === input.category && row.month === input.month);
    const item = { ...input, id: existing?.id ?? nextBudget++ };
    budgets = budgets.filter((row) => row.id !== item.id); budgets.push(item); return reply(item);
  }
  if (path.startsWith('/budgets/') && method === 'DELETE') {
    const id = Number(path.split('/').at(-1)); budgets = budgets.filter((row) => row.id !== id); return reply(id);
  }
  return route.fulfill({ status: 404, body: '{}' });
});

try {
  await page.goto(`${process.env.FEATURE_TEST_URL ?? 'http://127.0.0.1:5178'}/tests/feature-fixture.html`);
  await page.getByRole('table').waitFor();
  assert.equal(await page.locator('tbody tr').count(), 4);
  assert.match(await page.locator('tbody tr').first().textContent(), /Entertainment fixture/);
  const add = page.getByRole('button', { name: 'Add transaction', exact: true });
  await add.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const amount = dialog.getByLabel('Amount (USD)');
  assert.equal(await amount.evaluate((element) => element === document.activeElement), true);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await dialog.evaluate((element) => element.contains(document.activeElement)), true);
  }
  for (const invalid of ['', '0', '-1', '1.001', 'abc']) {
    await amount.fill(invalid);
    await dialog.getByRole('button', { name: 'Add transaction', exact: true }).click();
    await dialog.getByRole('alert').waitFor();
    assert.equal(writes, 0);
  }
  await amount.fill('0.30');
  await dialog.getByLabel('Date', { exact: true }).fill('9999-01-01');
  await dialog.getByRole('button', { name: 'Add transaction', exact: true }).click();
  assert.equal(writes, 0);
  await dialog.getByLabel('Date', { exact: true }).fill(date);
  await dialog.getByRole('button', { name: 'Income', exact: true }).click();
  await dialog.getByLabel('Note (optional)').fill('Browser income');
  failNext = true;
  await dialog.getByRole('button', { name: 'Add transaction', exact: true }).click();
  await dialog.getByRole('alert').filter({ hasText: 'Fixture server rejected' }).waitFor();
  assert.equal(await amount.inputValue(), '0.30');
  assert.equal(transactions.length, 4);
  await dialog.getByRole('button', { name: 'Add transaction', exact: true }).click();
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(), true);
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(transactions.length, 5);
  assert.equal(transactions.at(-1).amount, 0.3);
  assert.equal(await add.evaluate((element) => element === document.activeElement), true);
  await page.getByRole('button', { name: /Edit Browser income/ }).click();
  await amount.fill('15.25');
  await dialog.getByLabel('Category', { exact: true }).selectOption('Freelance');
  await dialog.getByLabel('Date', { exact: true }).fill('2024-01-15');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await dialog.waitFor({ state: 'hidden' });
  await page.getByLabel('Type', { exact: true }).selectOption('income');
  await page.getByLabel('Category', { exact: true }).selectOption('Freelance');
  await page.getByLabel('Month', { exact: true }).fill('2024-01');
  assert.equal(await page.locator('tbody tr').count(), 1);
  assert.match(await page.locator('.transactions-summary').textContent(), /15.25/);
  await page.getByLabel('Search', { exact: true }).fill('does not exist');
  await page.getByText('No transactions match', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  assert.equal(await page.locator('tbody tr').count(), 5);
  while (await page.getByRole('button', { name: /^Dismiss:/ }).count()) await page.getByRole('button', { name: /^Dismiss:/ }).first().click();
  const remove = page.getByRole('button', { name: /Delete Browser income/ });
  await remove.click();
  assert.equal(await dialog.getByRole('button', { name: 'Keep transaction' }).evaluate((element) => element === document.activeElement), true);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await remove.evaluate((element) => element === document.activeElement), true);
  await remove.click();
  await dialog.getByRole('button', { name: 'Delete transaction', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(transactions.length, 4);
  assert.equal(await page.locator('.table-scroll').evaluate((element) => element === document.activeElement), true);

  await page.getByRole('button', { name: 'Budgets test' }).click();
  assert.equal(await page.locator('tbody tr').count(), 7);
  const row = (category) => page.locator('tbody tr').filter({ has: page.getByRole('rowheader', { name: category, exact: true }) });
  assert.match(await row('Food').textContent(), /Near limit/);
  assert.match(await row('Transport').textContent(), /On track/);
  assert.match(await row('Entertainment').textContent(), /Exceeded by \$1.00/);
  await page.getByLabel('Budget month').fill('2030-04');
  await page.getByRole('button', { name: 'Set Food budget', exact: true }).click();
  await dialog.getByLabel('Monthly limit (USD)').fill('0');
  const beforeInvalid = writes;
  await dialog.getByRole('button', { name: 'Save budget' }).click();
  assert.equal(writes, beforeInvalid);
  await dialog.getByLabel('Monthly limit (USD)').fill('15.99');
  await dialog.getByRole('button', { name: 'Save budget' }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.match(await row('Food').textContent(), /15.99/);
  await page.getByRole('button', { name: 'Edit Food budget', exact: true }).click();
  assert.equal(await dialog.getByLabel('Monthly limit (USD)').inputValue(), '15.99');
  await dialog.getByLabel('Monthly limit (USD)').fill('20');
  await dialog.getByRole('button', { name: 'Save budget' }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(budgets.filter((item) => item.month === '2030-04' && item.category === 'Food').length, 1);
  await page.getByRole('button', { name: 'Remove Food budget', exact: true }).click();
  await dialog.getByRole('button', { name: 'Remove budget', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  assert.match(await row('Food').textContent(), /No budget/);
  assert.equal(transactions.length, 4);
  await page.getByRole('button', { name: 'Read-only test' }).click();
  assert.equal(await page.locator('table button').count(), 0);

  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `overflow at ${width}`);
  }
  await page.getByRole('button', { name: 'Transactions test' }).click();
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `transactions overflow at ${width}`);
  }
  await page.setViewportSize({ width: 360, height: 560 });
  await page.getByRole('button', { name: 'Add transaction', exact: true }).click();
  const rect = await dialog.boundingBox();
  assert.ok(rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= 361 && rect.y + rect.height <= 561);
  await mkdir('node_modules/.cache/feature-checks', { recursive: true });
  await page.screenshot({ path: 'node_modules/.cache/feature-checks/mobile-dialog.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Budgets test' }).click();
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `budgets overflow at ${width}`);
  }
  await page.screenshot({ path: 'node_modules/.cache/feature-checks/budgets.png', fullPage: true });
  await page.getByRole('button', { name: 'Report test' }).click();
  assert.equal(await page.locator('tbody tr').count(), 7);
  assert.equal(await page.locator('table button').count(), 0);
  assert.equal(await page.locator('.report-category').count(), 7);
  assert.match(await page.locator('.report-summary').textContent(), /\$500.00.*\$201.00.*\$299.00.*59.8%/);
  assert.match(await page.locator('.report-breakdown').textContent(), /Entertainment.*\$101.00.*50.2%/);
  assert.match(await page.locator('tbody tr').filter({ hasText: 'Entertainment' }).textContent(), /101.0%.*Exceeded/);
  assert.equal(await page.getByRole('progressbar', { name: 'Entertainment budget used: 101.0%' }).getAttribute('value'), '100');
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `report overflow at ${width}`);
  }
  await page.screenshot({ path: 'node_modules/.cache/feature-checks/report.png', fullPage: true });
  await page.getByLabel('Report month').fill('2030-04');
  assert.match(await page.locator('.report-section').textContent(), /No transactions this month/);
  assert.match(await page.locator('.report-summary').textContent(), /Savings rate: N\/A/);
  assert.equal(await page.locator('progress').count(), 7);
  assert.equal(await page.locator('progress[value="0"]').count(), 7);
  await page.getByLabel('Report month').fill('');
  assert.equal(await page.getByLabel('Report month').inputValue(), '2030-04');
  console.log('PASS: report totals, percentages, all categories, capped bars with actual usage text, empty month, required month, read-only comparison, and responsive widths.');
  assert.deepEqual(errors, []);
  console.log('PASS: fixture-backed create/edit/delete, combined filters, validation, failed-request draft retention, pending Escape guard, dialog focus/Tab/Escape/restoration, budget set/edit/remove, 7 category rows, statuses, read-only mode, no horizontal overflow at 360/390/768/1024/1440px. This is not a live NestJS verification.');
} finally {
  await browser.close();
}
