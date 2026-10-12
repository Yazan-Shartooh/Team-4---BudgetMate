import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboard();
  }

  @Get('monthly')
  getMonthlySummary(@Query('month') month: string) {
    return this.reportsService.getMonthlySummary(month);
  }

  @Get('months')
  getMonths(): string[] {
    return this.reportsService.getMonths();
  }
}
