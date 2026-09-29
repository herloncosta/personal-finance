import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestUser } from '../auth/jwt-auth.guard';
import { BudgetsService } from './budgets.service';
import { UpsertBudgetDto } from './dto/budget.dto';

@Controller({ path: 'budgets', version: '1' })
export class BudgetsController {
  constructor(private readonly budgets: BudgetsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query('month') month?: string) {
    return this.budgets.listWithSpent(user.id, month ?? new Date().toISOString().slice(0, 7));
  }

  @Post()
  upsert(@CurrentUser() user: RequestUser, @Body() dto: UpsertBudgetDto) {
    return this.budgets.upsert(user.id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.budgets.remove(user.id, id);
  }
}
