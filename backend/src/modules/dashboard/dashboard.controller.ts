import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestUser } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  summary(@CurrentUser() user: RequestUser, @Query('month') month?: string) {
    return this.dashboard.summary(user.id, month ?? new Date().toISOString().slice(0, 7));
  }
}
