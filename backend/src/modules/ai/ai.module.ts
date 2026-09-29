import { Module } from '@nestjs/common';
import { DashboardModule } from '../dashboard/dashboard.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { KeywordFallbackProvider } from './keyword-fallback.provider';
import { OpenAiProvider } from './openai.provider';

@Module({
  imports: [DashboardModule],
  controllers: [AiController],
  providers: [AiService, OpenAiProvider, KeywordFallbackProvider],
})
export class AiModule {}
