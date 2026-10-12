import type { SeedBudget, SeedTransaction } from '../types';

export type { SeedBudget, SeedTransaction } from '../types';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** offset 0 = current month, 1 = previous month, and so on. */
export function monthKey(offset: number): string {
  const now = new Date();
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  firstOfCurrentMonth.setMonth(firstOfCurrentMonth.getMonth() - offset);
  return `${firstOfCurrentMonth.getFullYear()}-${pad2(firstOfCurrentMonth.getMonth() + 1)}`;
}

/** Returns a valid date in the requested month and never uses a future date. */
export function dateIn(offset: number, day: number): string {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setMonth(monthStart.getMonth() - offset);

  const year = monthStart.getFullYear();
  const monthIndex = monthStart.getMonth();
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  let safeDay = Math.max(1, Math.min(day, lastDayOfMonth));

  if (offset === 0) {
    safeDay = Math.min(safeDay, now.getDate());
  }

  return `${year}-${pad2(monthIndex + 1)}-${pad2(safeDay)}`;
}

// 32 sample transactions based on the project data, spread across three months.
// Dates are generated dynamically, so the sample always uses the current,
// previous, and two-months-ago periods while keeping the YYYY-MM-DD format.
export const SEED_TRANSACTIONS: SeedTransaction[] = [
  // Current month: income = 1,500.00; expenses = 858.50; savings = 641.50.
  {
    id: 1,
    type: 'income',
    amount: 1200,
    category: 'Salary',
    date: dateIn(0, 1),
    note: 'Monthly salary',
  },
  {
    id: 2,
    type: 'income',
    amount: 300,
    category: 'Freelance',
    date: dateIn(0, 8),
    note: 'Freelance project',
  },
  {
    id: 3,
    type: 'expense',
    amount: 400,
    category: 'Housing',
    date: dateIn(0, 1),
    note: 'Rent',
  },
  {
    id: 4,
    type: 'expense',
    amount: 70,
    category: 'Bills',
    date: dateIn(0, 2),
    note: 'Electricity and internet',
  },
  {
    id: 5,
    type: 'expense',
    amount: 85.5,
    category: 'Food',
    date: dateIn(0, 3),
    note: 'Weekly groceries',
  },
  {
    id: 6,
    type: 'expense',
    amount: 45,
    category: 'Transport',
    date: dateIn(0, 4),
    note: 'Monthly bus pass',
  },
  {
    id: 7,
    type: 'expense',
    amount: 45,
    category: 'Entertainment',
    date: dateIn(0, 5),
    note: 'Cinema ticket',
  },
  {
    id: 8,
    type: 'expense',
    amount: 62.3,
    category: 'Food',
    date: dateIn(0, 6),
    note: 'Supermarket',
  },
  {
    id: 9,
    type: 'expense',
    amount: 25,
    category: 'Health',
    date: dateIn(0, 7),
    note: 'Pharmacy',
  },
  {
    id: 10,
    type: 'expense',
    amount: 38,
    category: 'Transport',
    date: dateIn(0, 8),
    note: 'Taxi',
  },
  {
    id: 11,
    type: 'expense',
    amount: 37.7,
    category: 'Food',
    date: dateIn(0, 9),
    note: 'Lunch with friends',
  },
  {
    id: 12,
    type: 'expense',
    amount: 50,
    category: 'Entertainment',
    date: dateIn(0, 9),
    note: 'Concert',
  },

  // Previous month.
  {
    id: 13,
    type: 'income',
    amount: 1200,
    category: 'Salary',
    date: dateIn(1, 1),
    note: 'Monthly salary',
  },
  {
    id: 14,
    type: 'income',
    amount: 250,
    category: 'Freelance',
    date: dateIn(1, 18),
    note: 'Freelance project',
  },
  {
    id: 15,
    type: 'income',
    amount: 50,
    category: 'Other Income',
    date: dateIn(1, 25),
    note: 'Extra side cash',
  },
  {
    id: 16,
    type: 'expense',
    amount: 400,
    category: 'Housing',
    date: dateIn(1, 1),
    note: 'Rent',
  },
  {
    id: 17,
    type: 'expense',
    amount: 85,
    category: 'Bills',
    date: dateIn(1, 3),
    note: 'Electricity and internet',
  },
  {
    id: 18,
    type: 'expense',
    amount: 90,
    category: 'Food',
    date: dateIn(1, 5),
    note: 'Groceries',
  },
  {
    id: 19,
    type: 'expense',
    amount: 40,
    category: 'Transport',
    date: dateIn(1, 8),
    note: 'Fuel',
  },
  {
    id: 20,
    type: 'expense',
    amount: 30,
    category: 'Entertainment',
    date: dateIn(1, 11),
    note: 'Streaming and games',
  },
  {
    id: 21,
    type: 'expense',
    amount: 60,
    category: 'Health',
    date: dateIn(1, 12),
    note: 'Dentist',
  },
  {
    id: 22,
    type: 'expense',
    amount: 75,
    category: 'Food',
    date: dateIn(1, 14),
    note: 'Groceries',
  },
  {
    id: 23,
    type: 'expense',
    amount: 55,
    category: 'Transport',
    date: dateIn(1, 20),
    note: 'Train tickets',
  },
  {
    id: 24,
    type: 'expense',
    amount: 110.4,
    category: 'Food',
    date: dateIn(1, 22),
    note: 'Family dinner',
  },
  {
    id: 25,
    type: 'expense',
    amount: 22.5,
    category: 'Entertainment',
    date: dateIn(1, 27),
    note: 'Bowling',
  },

  // Two months ago: income = 1,000.00; expenses = 1,140.00; savings = -140.00.
  {
    id: 26,
    type: 'income',
    amount: 1000,
    category: 'Salary',
    date: dateIn(2, 1),
    note: 'Monthly salary',
  },
  {
    id: 27,
    type: 'expense',
    amount: 400,
    category: 'Housing',
    date: dateIn(2, 1),
    note: 'Rent',
  },
  {
    id: 28,
    type: 'expense',
    amount: 90,
    category: 'Bills',
    date: dateIn(2, 4),
    note: 'Electricity and internet',
  },
  {
    id: 29,
    type: 'expense',
    amount: 180,
    category: 'Food',
    date: dateIn(2, 6),
    note: 'Groceries',
  },
  {
    id: 30,
    type: 'expense',
    amount: 180,
    category: 'Health',
    date: dateIn(2, 15),
    note: 'Medical check-up',
  },
  {
    id: 31,
    type: 'expense',
    amount: 170,
    category: 'Food',
    date: dateIn(2, 19),
    note: 'Groceries and restaurant',
  },
  {
    id: 32,
    type: 'expense',
    amount: 120,
    category: 'Entertainment',
    date: dateIn(2, 23),
    note: 'Weekend trip',
  },
];

// Starter budgets for the current month and the previous month.
export const SEED_BUDGETS: SeedBudget[] = [
  { id: 1, category: 'Food', month: monthKey(0), amount: 300 },
  { id: 2, category: 'Transport', month: monthKey(0), amount: 100 },
  { id: 3, category: 'Entertainment', month: monthKey(0), amount: 80 },
  { id: 4, category: 'Food', month: monthKey(1), amount: 300 },
  { id: 5, category: 'Transport', month: monthKey(1), amount: 100 },
  { id: 6, category: 'Entertainment', month: monthKey(1), amount: 80 },
];
