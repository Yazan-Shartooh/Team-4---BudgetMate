import { IsNotEmpty, IsNumber, IsString, Matches, Max, MaxLength, IsPositive } from 'class-validator';

export class CreateBudgetDto {
  @IsString({ message: 'Category is required.' })
  @IsNotEmpty({ message: 'Category is required.' })
  @MaxLength(100, { message: 'Category is too long.' })
  category!: string;

  @IsString({ message: 'Month is required in YYYY-MM format.' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Month must use YYYY-MM format.',
  })
  month!: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Budget amount must be a number with at most two decimal places.' },
  )
  @IsPositive({ message: 'Budget amount must be greater than zero.' })
  @Max(1_000_000, { message: 'Budget amount is too large.' })
  amount!: number;
}
