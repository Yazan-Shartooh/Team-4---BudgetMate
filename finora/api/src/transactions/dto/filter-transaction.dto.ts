import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import type { TransactionType } from '../../types';

export class FilterTransactionDto {
  @IsOptional()
  @IsIn(['income', 'expense'], {
    message: 'Type filter must be "income" or "expense".',
  })
  type?: TransactionType;

  @IsOptional()
  @IsString({ message: 'Category filter must be text.' })
  @IsNotEmpty({ message: 'Category filter cannot be empty.' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'Month filter must use YYYY-MM format.' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Month filter must use YYYY-MM format.',
  })
  month?: string;
}
