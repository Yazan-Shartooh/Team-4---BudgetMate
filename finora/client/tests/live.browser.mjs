// Production UI + real NestJS: starts isolated child processes; refuses occupied ports.
// Run after both builds. Requires Chrome and Playwright (or PLAYWRIGHT_MODULE_PATH).
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import * as XLSX from 'xlsx';
const root = fileURLToPath(new URL('../', import.meta.url));
const apiRoot = path.resolve(root, '../api');
const out = path.join(root, 'node_modules/.cache/live-checks');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href : 'playwright');
const api = 'http://localhost:3000/api';
const origin = 'http://127.0.0.1:4173';
const children = [];
const logs = [];
let browser;
async function freePort(port) {
  const server = createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, resolve); });
  await new Promise(resolve => server.close(resolve));
}
function start(cwd, args, env = {}) {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, windowsHide: true });
  child.stdout.on('data', d => logs.push(d.toString()));
  child.stderr.on('data', d => logs.push(d.toString()));
  children.push(child); return child;
}
async function stop(child) { if (child.exitCode === null && !child.killed) { const done = once(child, 'exit'); child.kill(); await done; } }
async function ready(url) {
  for (let i=0;i<600;i++) { try { if ((await fetch(url)).ok) return; } catch {} await new Promise(r=>setTimeout(r,200)); }
  throw new Error(`Startup failed: ${url}\n${logs.join('')}`);
}
async function request(route, method = 'GET', body, status = 200) {
  const r = await fetch(api+route, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text(); assert.equal(r.status, status, `${method} ${route}: ${text}`);
  return text ? JSON.parse(text) : undefined;
}
const now = new Date();
const monthAt = offset => { const d=new Date(now.getFullYear(),now.getMonth()-offset,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
const month=monthAt(0), previous=monthAt(1), older=monthAt(2), empty=monthAt(4), date=`${month}-01`;
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const results=[];
function pass(message) { results.push(message); console.log('PASS: '+message); }
try {
  await mkdir(out,{recursive:true});
  await freePort(3000); await freePort(4173);
  let backend=start(apiRoot,['dist/main.js'],{PORT:'3000',CLIENT_ORIGIN:origin});
  start(root,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173','--strictPort']);
  await ready(api+'/transactions'); await ready(origin);
  const seeds=await request('/transactions'); assert.equal(seeds.length,32);
  assert.equal(new Set(seeds.map(r=>r.date.slice(0,7))).size,3);
  const seedBudgets=await request('/budgets'); assert.equal(seedBudgets.length,6);
  const categories=await request('/categories'); assert.equal(categories.income.length,3); assert.equal(categories.expense.length,7);
  const dashboard=await request('/reports/dashboard');
  assert.equal(dashboard.totalIncome,1500); assert.equal(dashboard.totalExpenses,858.5); assert.equal(dashboard.savings,641.5); assert.equal(dashboard.balance,1033.6);
  const usage=await request(`/budgets/usage?month=${month}`);
  assert.equal(usage.find(r=>r.category==='Food').status,'on_track');
  assert.equal(usage.find(r=>r.category==='Transport').status,'near_limit');
  assert.equal(usage.find(r=>r.category==='Entertainment').exceededBy,15);
  pass('Clean production startup; 32 seeds, three months, three income/seven expense categories and all starter budget statuses.');
  const valid={type:'expense',category:'Food',amount:10,date,note:'Validation probe'};
  for (const amount of [null,0,-1,'abc','12',1.001,1000001]) await request('/transactions','POST',{...valid,amount},400);
  for (const category of ['', 'Missing', 'Salary']) await request('/transactions','POST',{...valid,category},400);
  for (const invalidDate of ['', '2024-02-30', '9999-01-01']) await request('/transactions','POST',{...valid,date:invalidDate},400);
  for (const field of ['amount','category','date','type']) {const body={...valid};delete body[field];await request('/transactions','POST',body,400);}
  await request('/transactions/999999','PATCH',valid,404);await request('/transactions/999999','DELETE',undefined,404);
  for (const amount of [0,-1,'abc',1.001,1000001]) await request('/budgets','PUT',{category:'Food',month,amount},400);
  await request('/budgets','PUT',{category:'Salary',month,amount:100},400);
  await request('/budgets','PUT',{category:'Food',month:'2024-13',amount:100},400);
  assert.equal((await request('/transactions')).length,32);
  pass('Live API rejects invalid/missing amounts, categories, dates, income budgets and missing transaction IDs.');
  browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
  page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const main=page.locator('main');
  async function nav(href) { await page.locator(`#app-sidebar a[href="${href}"]`).click(); }
  async function dismiss() { for (const b of await page.getByRole('button',{name:/^Dismiss:/}).all()) await b.click(); }
  async function textHas(locator,expected) {await locator.filter({hasText:expected}).first().waitFor();}
  async function report(expectedMonth,income,expenses) {
    await nav('/reports/monthly'); await main.getByLabel('Report month').fill(expectedMonth);
    const summary=main.locator('.report-summary');
    await textHas(summary,money(income)); await textHas(summary,money(expenses)); await textHas(summary,money(Math.round((income-expenses)*100)/100));
  }
  async function checkDashboard(income,expenses,balance) {
    await nav('/'); await textHas(main.locator('.dashboard-stats'),money(expenses));
    assert.match(await main.locator('.dashboard-stats').innerText(),new RegExp(money(income).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    await textHas(main.locator('.dashboard-balance'),money(balance));
  }
  async function add(amount,category,note,type='expense',at=date) {
    await nav('/transactions/new');
    await main.getByRole('button',{name:type==='income'?'Income':'Expense',exact:true}).click();
    await main.getByLabel('Amount (USD)').fill(String(amount));await main.getByLabel('Category',{exact:true}).selectOption(category);
    await main.getByLabel('Date',{exact:true}).fill(at);await main.getByLabel('Note (optional)').fill(note);
    await main.getByRole('button',{name:'Add transaction',exact:true}).click();
    await main.getByRole('heading',{name:'Transactions',exact:true}).waitFor();await dismiss();
  }
  await page.goto(origin); await main.locator('.dashboard-balance').waitFor();
  await nav('/transactions/new');
  for(const value of ['', '0','-1','abc','1.001']) {await main.getByLabel('Amount (USD)').fill(value);await main.getByRole('button',{name:'Add transaction',exact:true}).click();await main.getByRole('alert').waitFor();}
  assert.equal((await request('/transactions')).length,32);
  await add(20,'Food','Live flow A expense');
  await textHas(main.locator('tbody tr'),'Live flow A expense');
  await report(month,1500,878.5);await checkDashboard(1500,878.5,1013.6);
  await nav('/budgets');await textHas(main.locator('tr').filter({hasText:'Food'}), '$205.50');
  await add(50,'Freelance','Live flow A income','income');
  await report(month,1550,878.5);await checkDashboard(1550,878.5,1063.6);
  await page.reload();await main.locator('.dashboard-balance').waitFor();await textHas(main.locator('.dashboard-balance'),'$1,063.60');
  pass('A: global Add Transaction rejects invalid inputs; income/expense save through API and update history, dashboard, budgets, reports; browser reload retains changes.');
  await nav('/transactions');
  let row=main.locator('tbody tr').filter({hasText:'Live flow A expense'});
  await row.getByRole('button',{name:/^Edit /}).click();
  let dialog=page.getByRole('dialog');await dialog.getByLabel('Amount (USD)').fill('30');await dialog.getByRole('button',{name:'Save changes'}).click();await dialog.waitFor({state:'hidden'});await dismiss();
  await report(month,1550,888.5);await checkDashboard(1550,888.5,1053.6);
  await nav('/transactions');await row.getByRole('button',{name:/^Delete /}).click();await page.getByRole('dialog').getByRole('button',{name:'Delete transaction',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await dismiss();
  await report(month,1550,858.5);await checkDashboard(1550,858.5,1083.6);
  pass('B: edit amount and delete via confirmation immediately recalculate dashboard, report and balance.');
  await nav('/budgets');
  for(const [category,amount] of [['Food',200],['Health',100],['Shopping',50]]) {
    await main.getByRole('button',{name:new RegExp(`^(Set|Edit) ${category} budget$`)}).click();
    await page.getByRole('dialog').getByLabel('Monthly limit (USD)').fill(String(amount));
    await page.getByRole('dialog').getByRole('button',{name:'Save budget'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await dismiss();
  }
  await add(20,'Food','Live flow C expense');await nav('/budgets');
  const food=main.locator('tbody tr').filter({has:page.getByRole('rowheader',{name:'Food',exact:true})});
  await textHas(food,'Exceeded');assert.match(await food.innerText(),/\$5\.50/);assert.match(await food.innerText(),/102\.8%/);
  await main.getByRole('button',{name:'Edit Food budget'}).click();await page.getByRole('dialog').getByLabel('Monthly limit (USD)').fill('250');await page.getByRole('dialog').getByRole('button',{name:'Save budget'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await dismiss();await textHas(food,'Near limit');
  assert.equal((await request('/budgets')).filter(b=>b.category==='Food'&&b.month===month).length,1);
  await main.getByRole('button',{name:'Remove Food budget'}).click();await page.getByRole('dialog').getByRole('button',{name:'Remove budget',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await dismiss();await textHas(food,'No budget');await textHas(food,'$205.50');
  await report(month,1550,878.5);
  pass('C: set several budgets, exceed Food by $5.50, edit without duplicates and remove budget while retaining spending.');
  for(const [m,inc,exp,rate] of [[previous,1500,967.9,'35.5%'],[older,1000,1140,'-14.0%'],[empty,0,0,'N/A'],[month,1550,878.5,'43.3%']]) {
    await report(m,inc,exp);await textHas(main.locator('.report-summary'),rate);
    if(m===older) await textHas(main.locator('.report-note--overspent'),'Overspent');
    if(m===empty) await main.getByRole('heading',{name:'No transactions this month'}).waitFor();
    const live=await request(`/reports/monthly?month=${m}`);assert.equal(live.totalIncome,inc);assert.equal(live.totalExpenses,exp);
    for(const category of live.spendingByCategory) {
      const item=main.locator('.report-category').filter({has:page.locator('span').filter({hasText:new RegExp(`^${category.category}$`)})});
      await textHas(item,money(category.amount)); await textHas(item,`${category.percentage.toFixed(1)}%`);
    }
    if(inc) await textHas(main.locator('.report-note').filter({hasText:'Largest spending category'}),'Housing');
  }
  pass('D: current, previous, overspent and empty months show matching UI/API totals, savings rates, largest category and clear empty/N/A states.');
  await nav('/transactions');await main.getByLabel('Type',{exact:true}).selectOption('expense');await main.getByLabel('Category',{exact:true}).selectOption('Food');await main.getByLabel('Month',{exact:true}).fill(month);
  assert.equal(await main.locator('tbody tr').count(),4);
  async function download(label) {const promise=page.waitForEvent('download');await main.getByRole('button',{name:label,exact:true}).click();const file=await promise;const dest=path.join(out,file.suggestedFilename());await file.saveAs(dest);return XLSX.read(await readFile(dest), {type: "buffer"});}
  let book=await download('Export transactions');assert.equal(XLSX.utils.sheet_to_json(book.Sheets.Transactions).length,4);
  await main.getByLabel('Search',{exact:true}).fill('no such entry');await main.getByRole('heading',{name:'No transactions match'}).waitFor();await main.getByRole('button',{name:'Clear filters'}).click();assert.equal(await main.locator('tbody tr').count(),34);
  await nav('/income');await main.getByLabel('Month',{exact:true}).fill(month);book=await download('Export income');assert.equal(XLSX.utils.sheet_to_json(book.Sheets.Transactions).length,3);
  await report(month,1550,878.5);book=await download('Export report');assert.deepEqual(book.SheetNames,['Summary','Transactions','Budget comparison']);assert.equal(book.Sheets.Summary.B3.v,1550);assert.equal(book.Sheets.Summary.B4.v,878.5);assert.equal(XLSX.utils.sheet_to_json(book.Sheets.Transactions).length,14);
  pass('Combined filters, no-results/reset and all three downloaded XLSX exports contain the displayed rows/month and totals.');
  await nav('/income');let incomeRow=main.locator('tbody tr').filter({hasText:'Live flow A income'});await incomeRow.getByRole('button',{name:/^Edit /}).click();dialog=page.getByRole('dialog');await dialog.getByLabel('Category',{exact:true}).selectOption('Other Income');await dialog.getByLabel('Date',{exact:true}).fill(`${previous}-01`);await dialog.getByLabel('Amount (USD)').fill('75');await dialog.getByRole('button',{name:'Save changes'}).click();await dialog.waitFor({state:'hidden'});await dismiss();
  await report(previous,1575,967.9);await report(month,1500,878.5);
  await nav('/income');await main.getByLabel('Month',{exact:true}).fill(previous);await incomeRow.getByRole('button',{name:/^Delete /}).click();await page.getByRole('dialog').getByRole('button',{name:'Delete transaction',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await dismiss();await report(previous,1500,967.9);
  pass('Income reuses transaction mutations: category/month/amount edits and deletion recalculate both affected reports.');
  for(const width of [360,390,768,1024,1440]) {
    await page.setViewportSize({width,height:900});
    for(const route of ['/','/income','/transactions','/transactions/new','/budgets','/reports/monthly','/about']) {
      await page.goto(origin+route);await main.locator('h1').waitFor();await page.waitForLoadState('networkidle');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`overflow: ${width} ${route}`);
    }
    await page.screenshot({path:path.join(out,`about-${width}.png`),fullPage:true});
  }
  await page.setViewportSize({width:360,height:560});await page.goto(origin+'/transactions');await main.getByRole('button',{name:'Add transaction',exact:true}).click();dialog=page.getByRole('dialog');await dialog.waitFor();
  assert.equal(await dialog.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}),true);
  for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(e=>e.contains(document.activeElement)),true);}
  await page.screenshot({path:path.join(out,'dialog-mobile.png'),fullPage:true});await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('dialog',{name:'Main navigation'}).waitFor();await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'false');
  pass('All seven screens fit 360/390/768/1024/1440px; mobile dialog fits/scrolls, traps focus and closes with Escape; mobile navigation opens/closes.');
  await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/reports/monthly');await main.locator('.report-summary').waitFor();await page.screenshot({path:path.join(out,'report-desktop.png'),fullPage:true});
  // Real failure: stop only the backend owned by this script. Retain the unsaved draft.
  await page.goto(origin+'/transactions/new');await main.getByLabel('Amount (USD)').fill('9');await main.getByLabel('Note (optional)').fill('Retain this draft');await stop(backend);
  await main.getByRole('button',{name:'Add transaction',exact:true}).click();await main.getByRole('alert').waitFor();assert.equal(await main.getByLabel('Note (optional)').inputValue(),'Retain this draft');
  await page.goto(origin+'/');await main.getByRole('alert').waitFor();assert.equal(await main.locator('.dashboard-stats').count(),0);
  backend=start(apiRoot,['dist/main.js'],{PORT:'3000',CLIENT_ORIGIN:origin});await ready(api+'/transactions');await main.getByRole('button',{name:'Try again'}).click();await main.locator('.dashboard-balance').waitFor();
  assert.equal((await request('/transactions')).length,32);assert.equal((await request('/budgets')).length,6);await textHas(main.locator('.dashboard-balance'),'$1,033.60');
  pass('Backend outage shows errors without mock data and retains form draft; retry recovers; application-server restart restores the seed data.');
  assert.deepEqual(errors,[]);pass('No uncaught browser errors.');
  await writeFile(path.join(out,'results.json'),JSON.stringify({verifiedAt:new Date().toISOString(),results},null,2));
} catch(error) { console.error(logs.join(''));throw error; }
finally { await browser?.close();for(const child of children.reverse())await stop(child); }

