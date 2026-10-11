import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import {
  fromCents,
  isValidDate,
  isValidMonth,
  monthOf,
  todayISO,
  toCents,
} from '../common/utils';
import { SEED_TRANSACTIONS, type SeedTransaction } from '../seeds/seed-data';
import type { Transaction, TransactionFilter, TransactionType } from '../types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

type TransactionCandidate = {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
};

@Injectable()
export class TransactionsService implements OnModuleInit {
  private transactions: Transaction[] = [];
  private nextTransactionId = 1;

  constructor(private readonly categoriesService: CategoriesService) {}

  onModuleInit(): void {
    // Load seed data through the same business-rule validator as user-created data.
    this.transactions = [];
    for (const seed of SEED_TRANSACTIONS) {
      this.assertValid(seed);
      this.transactions.push(this.toStoredTransaction(seed));
    }
    this.nextTransactionId =
      this.transactions.reduce(
        (maxId, transaction) => Math.max(maxId, transaction.id),
        0,
      ) + 1;
  }

  create(dto: CreateTransactionDto): Transaction {
    const candidate: TransactionCandidate = {
      type: dto.type,
      amount: dto.amount,
      category: dto.category,
      date: dto.date,
      note: dto.note ?? '',
    };
    this.assertValid(candidate);

    const transaction = this.toStoredTransaction(candidate);
    this.transactions.push(transaction);
    return { ...transaction };
  }

  findAll(filter: TransactionFilter = {}): Transaction[] {
    this.assertValidFilter(filter);
    return this.transactions
      .filter((transaction) => {
        if (filter.type && transaction.type !== filter.type) return false;
        if (filter.category && transaction.category !== filter.category)
          return false;
        if (filter.month && monthOf(transaction.date) !== filter.month)
          return false;
        return true;
      })
      .sort(
        (left, right) =>
          right.date.localeCompare(left.date) ||
          right.createdAt.localeCompare(left.createdAt),
      )
      .map((transaction) => ({ ...transaction }));
  }

  findOne(id: string): Transaction {
    const numericId = Number(id);
    const transaction = this.transactions.find((item) => item.id === numericId);
    if (!transaction) throw new NotFoundException('Transaction not found.');
    return { ...transaction };
  }

  update(id: string, dto: UpdateTransactionDto): Transaction {
    const numericId = Number(id);
    const index = this.transactions.findIndex((item) => item.id === numericId);
    if (index === -1) throw new NotFoundException('Transaction not found.');
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Provide at least one field to update.');
    }
    // PartialType's IsOptional decorator skips null values, so reject null explicitly.
    for (const [field, value] of Object.entries(dto)) {
      if (value === null) {
        throw new BadRequestException(`${field} cannot be null.`);
      }
    }

    const existing = this.transactions[index];
    const candidate: TransactionCandidate = {
      type: dto.type ?? existing.type,
      amount: dto.amount ?? existing.amount,
      category: dto.category ?? existing.category,
      date: dto.date ?? existing.date,
      note: dto.note !== undefined ? dto.note : existing.note,
    };

    // Validate the merged result, not just the patch. This catches invalid combinations.
    this.assertValid(candidate);

    const updated: Transaction = {
      ...existing,
      ...candidate,
      amount: fromCents(toCents(candidate.amount)),
      note: (candidate.note ?? '').trim(),
      id: existing.id,
      createdAt: existing.createdAt,
    };
    this.transactions[index] = updated;
    return { ...updated };
  }

  remove(id: string): void {
    const numericId = Number(id);
    const index = this.transactions.findIndex((item) => item.id === numericId);
    if (index === -1) throw new NotFoundException('Transaction not found.');
    this.transactions.splice(index, 1);
  }

  private assertValid(candidate: TransactionCandidate | SeedTransaction): void {
    if (candidate.type !== 'income' && candidate.type !== 'expense') {
      throw new BadRequestException('Type must be "income" or "expense".');
    }

    if (
      typeof candidate.amount !== 'number' ||
      !Number.isFinite(candidate.amount)
    ) {
      throw new BadRequestException(
        'Amount must be a number with at most two decimal places.',
      );
    }
    if (candidate.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero.');
    }
    if (candidate.amount > 1_000_000) {
      throw new BadRequestException('Amount is too large.');
    }
    if (
      Math.abs(candidate.amount * 100 - Math.round(candidate.amount * 100)) >
      1e-7
    ) {
      throw new BadRequestException(
        'Amount must have at most two decimal places.',
      );
    }

    if (
      typeof candidate.category !== 'string' ||
      candidate.category.trim() === ''
    ) {
      throw new BadRequestException('Category is required.');
    }
    if (
      !this.categoriesService.isValidCategory(
        candidate.type,
        candidate.category,
      )
    ) {
      if (this.categoriesService.isKnownCategory(candidate.category)) {
        const actualType = this.categoriesService.isIncomeCategory(
          candidate.category,
        )
          ? 'income'
          : 'expense';
        throw new BadRequestException(
          `${candidate.category} is an ${actualType} category and cannot be used for an ${candidate.type}.`,
        );
      }
      throw new BadRequestException(
        `Category "${candidate.category}" does not exist.`,
      );
    }

    if (!isValidDate(candidate.date)) {
      throw new BadRequestException(
        'Date must be a real date in YYYY-MM-DD format.',
      );
    }
    if (candidate.date > todayISO()) {
      throw new BadRequestException('Date cannot be in the future.');
    }

    if (candidate.note !== undefined && typeof candidate.note !== 'string') {
      throw new BadRequestException('Note must be text.');
    }
    if ((candidate.note ?? '').length > 200) {
      throw new BadRequestException('Note must be 200 characters or fewer.');
    }
  }

  private assertValidFilter(filter: TransactionFilter): void {
    if (
      filter.type !== undefined &&
      filter.type !== 'income' &&
      filter.type !== 'expense'
    ) {
      throw new BadRequestException(
        'Type filter must be "income" or "expense".',
      );
    }
    if (
      filter.category !== undefined &&
      !this.categoriesService.isKnownCategory(filter.category)
    ) {
      throw new BadRequestException(
        `Category "${filter.category}" does not exist.`,
      );
    }
    if (filter.month !== undefined && !isValidMonth(filter.month)) {
      throw new BadRequestException('Month filter must use YYYY-MM format.');
    }
  }

  private toStoredTransaction(
    candidate: TransactionCandidate | SeedTransaction,
  ): Transaction {
    const id = 'id' in candidate ? candidate.id : this.nextTransactionId++;

    return {
      id,
      type: candidate.type,
      amount: fromCents(toCents(candidate.amount)),
      category: candidate.category,
      date: candidate.date,
      note: (candidate.note ?? '').trim(),
      createdAt: new Date().toISOString(),
    };
  }
}
