import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [CategoriesModule, TransactionsModule, BudgetsModule, ReportsModule],
})
export class AppModule {}
