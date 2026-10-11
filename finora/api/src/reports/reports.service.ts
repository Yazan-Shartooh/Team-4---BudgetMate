import { BadRequestException, Injectable } from '@nestjs/common';
import { BudgetsService } from '../budgets/budgets.service';
import { CategoriesService } from '../categories/categories.service';
import {
  currentMonth,
  fromCents,
  isValidMonth,
  monthOf,
  round1,
  toCents,
} from '../common/utils';
import { TransactionsService } from '../transactions/transactions.service';
import type { BudgetUsage, Transaction } from '../types';

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

interface FinancialTotals {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number | null;
  overspent: boolean;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly budgetsService: BudgetsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  getDashboard() {
    const month = currentMonth();
    const currentTransactions = this.transactionsService.findAll({ month });
    const allTransactions = this.transactionsService.findAll();
    const totals = this.calculateTotals(currentTransactions);
    const allTimeIncome = this.sumCents(
      allTransactions.filter((item) => item.type === 'income'),
    );
    const allTimeExpenses = this.sumCents(
      allTransactions.filter((item) => item.type === 'expense'),
    );
    const budgetAlerts = this.budgetsService
      .getUsage(month)
      .filter(
        (item) => item.status === 'near_limit' || item.status === 'exceeded',
      );

    return {
      month,
      ...totals,
      balance: fromCents(allTimeIncome - allTimeExpenses),
      spendingByCategory: this.getSpendingByCategory(
        currentTransactions,
        totals.totalExpenses,
      ),
      budgetAlerts,
      recentTransactions: allTransactions.slice(0, 5),
    };
  }

  getMonthlySummary(month?: string) {
    this.assertMonth(month);
    const requestedMonth = month as string;
    const transactions = this.transactionsService.findAll({
      month: requestedMonth,
    });
    const totals = this.calculateTotals(transactions);
    const spendingByCategory = this.getSpendingByCategory(
      transactions,
      totals.totalExpenses,
    );
    const largest = spendingByCategory[0];

    return {
      month: requestedMonth,
      hasTransactions: transactions.length > 0,
      message: transactions.length === 0 ? 'No transactions this month' : null,
      ...totals,
      spendingByCategory,
      budgetComparison: this.budgetsService.getUsage(requestedMonth),
      largestCategory: largest
        ? {
            category: largest.category,
            amount: largest.amount,
            percentage: largest.percentage,
          }
        : null,
    };
  }

  getMonths(): string[] {
    const months = new Set(
      this.transactionsService
        .findAll()
        .map((transaction) => monthOf(transaction.date)),
    );
    return [...months].sort((a, b) => b.localeCompare(a));
  }

  private calculateTotals(transactions: Transaction[]): FinancialTotals {
    const totalIncomeCents = this.sumCents(
      transactions.filter((item) => item.type === 'income'),
    );
    const totalExpensesCents = this.sumCents(
      transactions.filter((item) => item.type === 'expense'),
    );
    const savingsCents = totalIncomeCents - totalExpensesCents;
    const totalIncome = fromCents(totalIncomeCents);
    const totalExpenses = fromCents(totalExpensesCents);

    return {
      totalIncome,
      totalExpenses,
      savings: fromCents(savingsCents),
      savingsRate:
        totalIncomeCents === 0
          ? null
          : round1((savingsCents / totalIncomeCents) * 100),
      overspent: savingsCents < 0,
    };
  }

  private getSpendingByCategory(
    transactions: Transaction[],
    totalExpenses: number,
  ): CategorySpending[] {
    const totals = new Map<string, number>();
    for (const category of this.categoriesService.getExpenseCategories()) {
      totals.set(category, 0);
    }

    for (const transaction of transactions) {
      if (transaction.type === 'expense') {
        totals.set(
          transaction.category,
          (totals.get(transaction.category) ?? 0) + toCents(transaction.amount),
        );
      }
    }

    const totalExpensesCents = toCents(totalExpenses);
    return [...totals.entries()]
      .filter(([, cents]) => cents > 0)
      .map(([category, cents]) => ({
        category,
        amount: fromCents(cents),
        percentage:
          totalExpensesCents === 0
            ? 0
            : round1((cents / totalExpensesCents) * 100),
      }))
      .sort(
        (a, b) => b.amount - a.amount || a.category.localeCompare(b.category),
      );
  }

  private sumCents(transactions: Transaction[]): number {
    return transactions.reduce((sum, item) => sum + toCents(item.amount), 0);
  }

  private assertMonth(month: string | undefined): void {
    if (!month)
      throw new BadRequestException('Month is required in YYYY-MM format.');
    if (!isValidMonth(month))
      throw new BadRequestException('Month must use YYYY-MM format.');
  }
}
