export type Kind = 'income' | 'expense';
export type Transaction = {id:string;type:Kind;amount:number;category:string;date:string;note:string};
export type Budget = {category:string;month:string;amount:number};
export const incomeCategories=['Salary','Freelance','Gift'];
export const expenseCategories=['Food','Transport','Housing','Bills','Health','Entertainment'];
export const colors:Record<string,string>={Food:'#00a795',Transport:'#6f91cc',Housing:'#173e69',Bills:'#95cfc5',Health:'#e6b86b',Entertainment:'#b29ed9'};
export const today='2026-10-09';
export const currentMonth='2026-10';
const raw:[Kind,number,string,string,string][]=[
 ['income',4250,'Salary','2026-10-01','October salary'],['income',850,'Freelance','2026-10-06','Brand identity project'],['income',150,'Gift','2026-10-08','Birthday gift'],
 ['expense',1400,'Housing','2026-10-01','Monthly apartment rent'],['expense',185,'Food','2026-10-02','Weekly groceries'],['expense',42,'Transport','2026-10-02','Fuel refill'],['expense',120,'Bills','2026-10-03','Electricity & water'],['expense',125,'Entertainment','2026-10-03','Concert tickets'],['expense',74,'Health','2026-10-04','Pharmacy'],['expense',155,'Food','2026-10-04','Groceries & essentials'],['expense',65,'Transport','2026-10-05','Monthly transit pass'],['expense',80,'Bills','2026-10-05','Internet plan'],['expense',100,'Entertainment','2026-10-06','Dinner & cinema'],['expense',150,'Health','2026-10-07','Dental appointment'],['expense',150,'Bills','2026-10-07','Phone & insurance'],['expense',125,'Food','2026-10-08','Weekly grocery shop'],['expense',75,'Food','2026-10-09','Market & bakery'],['expense',18,'Transport','2026-10-09','Ride home'],
 ['income',4250,'Salary','2026-09-01','September salary'],['income',600,'Freelance','2026-09-15','Website illustrations'],['expense',1400,'Housing','2026-09-01','Monthly apartment rent'],['expense',420,'Food','2026-09-07','Groceries'],['expense',160,'Transport','2026-09-12','Transit & fuel'],['expense',310,'Bills','2026-09-14','Monthly utilities'],['expense',180,'Entertainment','2026-09-21','Weekend activities'],['expense',95,'Health','2026-09-23','Checkup'],['expense',220,'Food','2026-09-27','Groceries & dining']
];
export const seedTransactions:Transaction[]=raw.map((r,i)=>({id:`t${i+1}`,type:r[0],amount:r[1],category:r[2],date:r[3],note:r[4]}));
export const seedBudgets:Budget[]=[{category:'Food',month:currentMonth,amount:700},{category:'Housing',month:currentMonth,amount:1600},{category:'Transport',month:currentMonth,amount:200},{category:'Bills',month:currentMonth,amount:400},{category:'Entertainment',month:currentMonth,amount:200}];
export const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
export const total=(a:Transaction[],type:Kind)=>a.filter(t=>t.type===type).reduce((s,t)=>s+Math.round(t.amount*100),0)/100;
export const monthName=(s:string)=>new Date(s+'-02T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'});
export const dateLabel=(s:string)=>new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
export function budgetState(spent:number,amount?:number){return !amount?'No budget':spent>amount?'Exceeded':spent>=amount*.8?'Near limit':'On track'}
