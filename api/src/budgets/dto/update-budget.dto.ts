import { IsNumber, IsPositive, Max } from 'class-validator';

/** PATCH /budgets/:id changes the amount only; amount is required in the patch body. */
export class UpdateBudgetDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Budget amount must be a number with at most two decimal places.' },
  )
  @IsPositive({ message: 'Budget amount must be greater than zero.' })
  @Max(1_000_000, { message: 'Budget amount is too large.' })
  amount!: number;
}
