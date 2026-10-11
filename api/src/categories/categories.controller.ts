import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getCategories(): { income: string[]; expense: string[] } {
    return {
      income: this.categoriesService.getIncomeCategories(),
      expense: this.categoriesService.getExpenseCategories(),
    };
  }

  @Get('income')
  getIncomeCategories(): string[] {
    return this.categoriesService.getIncomeCategories();
  }

  @Get('expense')
  getExpenseCategories(): string[] {
    return this.categoriesService.getExpenseCategories();
  }
}
