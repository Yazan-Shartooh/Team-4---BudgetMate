import { Module } from '@nestjs/common';
import { BudgetsModule } from '../budgets/budgets.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TransactionsModule, BudgetsModule, CategoriesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
