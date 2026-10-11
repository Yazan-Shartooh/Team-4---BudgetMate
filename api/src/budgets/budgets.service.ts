import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { fromCents, isValidMonth, round1, toCents } from '../common/utils';
import { SEED_BUDGETS, type SeedBudget } from '../seeds/seed-data';
import type { Budget, BudgetStatus, BudgetUsage } from '../types';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService implements OnModuleInit {
  private budgets: Budget[] = [];
  private nextBudgetId = 1;

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly transactionsService: TransactionsService,
  ) {}

  onModuleInit(): void {
    this.budgets = [];
    for (const seed of SEED_BUDGETS) {
      this.assertValidBudget(seed);
      this.budgets.push({
        id: seed.id,
        category: seed.category,
        month: seed.month,
        amount: fromCents(toCents(seed.amount)),
      });
    }
    this.nextBudgetId =
      this.budgets.reduce((maxId, budget) => Math.max(maxId, budget.id), 0) + 1;
  }

  findAll(month?: string): Budget[] {
    this.assertMonth(month);
    return this.budgets
      .filter((budget) => budget.month === month)
      .map((budget) => ({ ...budget }))
      .sort(
        (a, b) =>
          b.month.localeCompare(a.month) ||
          a.category.localeCompare(b.category),
      );
  }

  create(dto: CreateBudgetDto): Budget {
    this.assertValidBudget(dto);
    const duplicate = this.budgets.some(
      (budget) =>
        budget.month === dto.month && budget.category === dto.category,
    );
    if (duplicate) {
      throw new ConflictException(
        `A budget for ${dto.category} already exists for ${dto.month}. Update the existing budget instead.`,
      );
    }

    const budget: Budget = {
      id: this.nextBudgetId++,
      category: dto.category,
      month: dto.month,
      amount: fromCents(toCents(dto.amount)),
    };
    this.budgets.push(budget);
    return { ...budget };
  }

  update(id: string, dto: UpdateBudgetDto): Budget {
    const numericId = Number(id);
    const index = this.budgets.findIndex((budget) => budget.id === numericId);
    if (index === -1) throw new NotFoundException('Budget not found.');
    this.assertAmount(dto.amount);

    const updated: Budget = {
      ...this.budgets[index],
      amount: fromCents(toCents(dto.amount)),
    };
    this.budgets[index] = updated;
    return { ...updated };
  }

  remove(id: string): void {
    const numericId = Number(id);
    const index = this.budgets.findIndex((budget) => budget.id === numericId);
    if (index === -1) throw new NotFoundException('Budget not found.');
    this.budgets.splice(index, 1);
  }

  getUsage(month?: string): BudgetUsage[] {
    this.assertMonth(month);
    const requestedMonth = month as string;
    const expenseCategories = this.categoriesService.getExpenseCategories();
    const monthTransactions = this.transactionsService.findAll({
      type: 'expense',
      month: requestedMonth,
    });

    return expenseCategories.map((category) => {
      const spentCents = monthTransactions
        .filter((transaction) => transaction.category === category)
        .reduce((sum, transaction) => sum + toCents(transaction.amount), 0);
      const budget = this.budgets.find(
        (item) => item.month === requestedMonth && item.category === category,
      );

      if (!budget) {
        return {
          category,
          month: requestedMonth,
          budgetId: null,
          budget: null,
          spent: fromCents(spentCents),
          remaining: null,
          exceededBy: 0,
          percentUsed: null,
          status: 'no_budget' as const,
        };
      }

      const budgetCents = toCents(budget.amount);
      const remainingCents = Math.max(budgetCents - spentCents, 0);
      const exceededCents = Math.max(spentCents - budgetCents, 0);
      const rawPercentUsed = (spentCents / budgetCents) * 100;
      let status: BudgetStatus;
      if (spentCents > budgetCents) {
        status = 'exceeded';
      } else if (spentCents / budgetCents >= 0.8) {
        status = 'near_limit';
      } else {
        status = 'on_track';
      }

      return {
        category,
        month: requestedMonth,
        budgetId: budget.id,
        budget: budget.amount,
        spent: fromCents(spentCents),
        remaining: fromCents(remainingCents),
        exceededBy: fromCents(exceededCents),
        percentUsed: round1(rawPercentUsed),
        status,
      };
    });
  }

  private assertMonth(month: string | undefined): void {
    if (!month)
      throw new BadRequestException('Month is required in YYYY-MM format.');
    if (!isValidMonth(month)) {
      throw new BadRequestException('Month must use YYYY-MM format.');
    }
  }

  private assertValidBudget(candidate: SeedBudget | CreateBudgetDto): void {
    this.assertMonth(candidate.month);
    if (!this.categoriesService.isExpenseCategory(candidate.category)) {
      if (this.categoriesService.isIncomeCategory(candidate.category)) {
        throw new BadRequestException(
          'Budgets can only be set for expense categories.',
        );
      }
      throw new BadRequestException(
        `Category "${candidate.category}" does not exist.`,
      );
    }
    this.assertAmount(candidate.amount);
  }

  private assertAmount(amount: number): void {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new BadRequestException(
        'Budget amount must be a number with at most two decimal places.',
      );
    }
    if (amount <= 0)
      throw new BadRequestException('Budget amount must be greater than zero.');
    if (amount > 1_000_000)
      throw new BadRequestException('Budget amount is too large.');
    if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-7) {
      throw new BadRequestException(
        'Budget amount must have at most two decimal places.',
      );
    }
  }
}
