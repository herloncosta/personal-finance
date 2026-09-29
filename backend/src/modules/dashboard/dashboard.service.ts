import { Injectable } from '@nestjs/common';
import { BudgetsService, monthStart } from '../budgets/budgets.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly budgets: BudgetsService,
  ) {}

  async summary(userId: string, monthStr: string) {
    const start = monthStart(monthStr);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const range = { userId, date: { gte: start, lt: end } };

    const [byType, byCat, daily, categories] = await Promise.all([
      this.prisma.transaction.groupBy({ by: ['type'], where: range, _sum: { amount: true } }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...range, type: 'expense', categoryId: { not: null } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      this.prisma.transaction.groupBy({
        by: ['date', 'type'],
        where: range,
        _sum: { amount: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.category.findMany({ where: { userId } }),
    ]);

    const income = this.sum(byType, 'income');
    const expense = this.sum(byType, 'expense');
    const catById = new Map(categories.map((c) => [c.id, c]));

    const byCategory = byCat.map((g) => {
      const c = catById.get(g.categoryId!);
      return {
        id: g.categoryId,
        name: c?.name ?? '?',
        color: c?.color ?? '#888',
        total: Number(g._sum.amount ?? 0),
      };
    });

    const days = new Map<string, { income: number; expense: number }>();
    for (const d of daily) {
      const key = d.date.toISOString().slice(0, 10);
      const row = days.get(key) ?? { income: 0, expense: 0 };
      row[d.type] = Number(d._sum.amount ?? 0);
      days.set(key, row);
    }
    const dailySeries = [...days.entries()].map(([date, v]) => ({ date: date.slice(8), ...v }));

    const budgetStatus = await this.budgets.listWithSpent(userId, monthStr);

    return { income, expense, balance: income - expense, byCategory, dailySeries, budgetStatus };
  }

  private sum(rows: { type: string; _sum: { amount: unknown } }[], type: string) {
    return rows.filter((r) => r.type === type).reduce((s, r) => s + Number(r._sum.amount ?? 0), 0);
  }
}
