import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  IsPositive,
} from 'class-validator';
import type { TransactionType } from '../../types';

export class CreateTransactionDto {
  @IsIn(['income', 'expense'], {
    message: 'Type must be "income" or "expense".',
  })
  type!: TransactionType;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with at most two decimal places.' },
  )
  @IsPositive({ message: 'Amount must be greater than zero.' })
  @Max(1_000_000, { message: 'Amount is too large.' })
  amount!: number;

  @IsString({ message: 'Category is required.' })
  @IsNotEmpty({ message: 'Category is required.' })
  category!: string;

  @IsString({ message: 'Date is required (YYYY-MM-DD).' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date is required in YYYY-MM-DD format.',
  })
  date!: string;

  @IsOptional()
  @IsString({ message: 'Note must be text.' })
  @MaxLength(200, { message: 'Note must be 200 characters or fewer.' })
  note?: string;
}
