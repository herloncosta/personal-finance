import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertBudgetDto } from './dto/budget.dto';

export const monthStart = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  if (!y || m < 1 || m > 12) throw new BadRequestException('month inválido (YYYY-MM)');
  return new Date(y, m - 1, 1);
};

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: CategoriesService,
  ) {}

  async upsert(userId: string, dto: UpsertBudgetDto) {
    const category = await this.categories.getOwned(userId, dto.categoryId);
    if (category.type !== 'expense') throw new BadRequestException('Orçamento só faz sentido para despesas');
    const month = monthStart(dto.month);
    return this.prisma.budget.upsert({
      where: { userId_categoryId_month: { userId, categoryId: dto.categoryId, month } },
      update: { limitAmount: dto.limitAmount },
      create: { userId, categoryId: dto.categoryId, month, limitAmount: dto.limitAmount },
      include: { category: { select: { id: true, name: true, color: true } } },
    });
  }

  async listWithSpent(userId: string, monthStr: string) {
    const month = monthStart(monthStr);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const [budgets, spent] = await Promise.all([
      this.prisma.budget.findMany({
        where: { userId, month },
        include: { category: { select: { id: true, name: true, color: true } } },
        orderBy: { limitAmount: 'desc' },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, type: 'expense', date: { gte: month, lt: end }, categoryId: { not: null } },
        _sum: { amount: true },
      }),
    ]);
    const spentBy = new Map(spent.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]));
    return budgets.map((b) => {
      const limit = Number(b.limitAmount);
      const used = spentBy.get(b.categoryId) ?? 0;
      return { ...b, limitAmount: limit, spent: used, pct: limit > 0 ? used / limit : 0 };
    });
  }

  async remove(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Orçamento não encontrado');
    await this.prisma.budget.delete({ where: { id } });
  }
}
