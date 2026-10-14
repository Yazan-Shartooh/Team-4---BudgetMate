import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getCategories() {
    return {
      income: this.categoriesService.getIncomeCategories(),
      expense: this.categoriesService.getExpenseCategories(),
    };
  }

  @Get('income')
  getIncomeCategories() {
    return this.categoriesService.getIncomeCategories();
  }

  @Get('expense')
  getExpenseCategories() {
    return this.categoriesService.getExpenseCategories();
  }
}
