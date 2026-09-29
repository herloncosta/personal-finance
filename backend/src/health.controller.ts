import { Controller, Get } from '@nestjs/common';
import { Public } from './modules/auth/jwt-auth.guard';

@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
