import { Injectable } from '@nestjs/common';
import { monthStart } from '../budgets/budgets.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GeneratedInsight } from './analysis-provider.interface';
import { KeywordFallbackProvider } from './keyword-fallback.provider';
import { OpenAiProvider } from './openai.provider';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const CACHE_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboard: DashboardService,
    private readonly openai: OpenAiProvider,
    private readonly fallback: KeywordFallbackProvider,
  ) {}

  async categorize(userId: string, description: string, type: 'income' | 'expense') {
    const categories = await this.prisma.category.findMany({ where: { userId } });
    const hints = categories.map((c) => ({ id: c.id, name: c.name, type: c.type }));

    let suggestion = { categoryName: null as string | null, confidence: 0 };
    let provider = this.fallback.name;
    if (this.openai.available) {
      try {
        suggestion = await this.openai.suggestCategory(description, type, hints);
        provider = this.openai.name;
      } catch {
        suggestion = await this.fallback.suggestCategory(description, type, hints);
      }
    } else {
      suggestion = await this.fallback.suggestCategory(description, type, hints);
    }

    // Match sem acento: modelos baratos costumam devolver "Alimentacao".
    const match = suggestion.categoryName
      ? categories.find((c) => c.type === type && norm(c.name) === norm(suggestion.categoryName!))
      : undefined;
    return {
      categoryId: match?.id ?? null,
      categoryName: match?.name ?? suggestion.categoryName,
      confidence: match ? suggestion.confidence : 0,
      provider,
    };
  }

  async insights(userId: string, monthStr: string, refresh = false) {
    const month = monthStart(monthStr);
    if (!refresh) {
      const cached = await this.prisma.aiInsight.findUnique({
        where: { userId_month: { userId, month } },
      });
      if (cached && Date.now() - cached.createdAt.getTime() < CACHE_MS) {
        return { ...cached.payload as object, provider: (cached.payload as any).provider, cached: true };
      }
    }

    const s = await this.dashboard.summary(userId, monthStr);
    const input = {
      month: monthStr,
      income: s.income,
      expense: s.expense,
      topCategories: s.byCategory.slice(0, 3).map((c) => ({ name: c.name, total: c.total })),
      overBudget: s.budgetStatus.filter((b) => b.pct >= 1).map((b) => ({ name: b.category.name, spent: b.spent, limit: b.limitAmount })),
    };

    let generated: GeneratedInsight;
    let provider = this.fallback.name;
    if (this.openai.available) {
      try {
        generated = await this.openai.generateInsights(input);
        provider = this.openai.name;
      } catch {
        generated = await this.fallback.generateInsights(input);
      }
    } else {
      generated = await this.fallback.generateInsights(input);
    }

    const payload = { ...generated, provider };
    await this.prisma.aiInsight.upsert({
      where: { userId_month: { userId, month } },
      update: { summary: generated.summary, payload },
      create: { userId, month, summary: generated.summary, payload },
    });
    return { ...payload, cached: false };
  }
}
