import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { EntryType } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequestUser } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';

class CategorizeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  description!: string;

  @IsEnum(EntryType)
  type!: EntryType;
}

class InsightsQuery {
  @Matches(/^\d{4}-\d{2}$/, { message: 'month deve ser YYYY-MM' })
  month!: string;

  @IsString()
  refresh?: string;
}

@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('categorize')
  @HttpCode(200)
  categorize(@CurrentUser() user: RequestUser, @Body() dto: CategorizeDto) {
    return this.ai.categorize(user.id, dto.description, dto.type);
  }

  @Get('insights')
  insights(@CurrentUser() user: RequestUser, @Query() q: InsightsQuery) {
    return this.ai.insights(user.id, q.month, q.refresh === 'true');
  }
}
