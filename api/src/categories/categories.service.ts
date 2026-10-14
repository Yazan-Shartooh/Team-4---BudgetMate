import { Injectable } from '@nestjs/common';
import type { TransactionType } from '../types';

const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Bills',
  'Health',
  'Entertainment',
  'Shopping',
];

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Other Income'];

@Injectable()
export class CategoriesService {
  getIncomeCategories() {
    return [...INCOME_CATEGORIES];
  }

  getExpenseCategories() {
    return [...EXPENSE_CATEGORIES];
  }

  isValidCategory(type: TransactionType, name: string) {
    return type === 'income'
      ? INCOME_CATEGORIES.includes(name)
      : EXPENSE_CATEGORIES.includes(name);
  }

  isExpenseCategory(name: string) {
    return EXPENSE_CATEGORIES.includes(name);
  }

  isIncomeCategory(name: string) {
    return INCOME_CATEGORIES.includes(name);
  }

  isKnownCategory(name: string) {
    return this.isExpenseCategory(name) || this.isIncomeCategory(name);
  }
}
