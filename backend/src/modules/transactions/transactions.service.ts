import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntryType } from '@prisma/client';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, ListTransactionsQuery, UpdateTransactionDto } from './dto/transaction.dto';

const include = {
  account: { select: { id: true, name: true } },
  category: { select: { id: true, name: true, color: true } },
};

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: AccountsService,
    private readonly categories: CategoriesService,
  ) {}

  async list(userId: string, q: ListTransactionsQuery) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const where = {
      userId,
      ...(q.type ? { type: q.type } : {}),
      ...(q.accountId ? { accountId: q.accountId } : {}),
      ...(q.categoryId ? { categoryId: q.categoryId } : {}),
      ...this.monthFilter(q.month),
    };
    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return { data: data.map(this.serialize), total, page, pageSize };
  }

  async create(userId: string, dto: CreateTransactionDto) {
    await this.accounts.getOwned(userId, dto.accountId);
    await this.checkCategory(userId, dto.type, dto.categoryId);
    const created = await this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        date: new Date(dto.date),
        description: dto.description.trim(),
        accountId: dto.accountId,
        categoryId: dto.categoryId ?? null,
      },
      include,
    });
    return this.serialize(created);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const current = await this.getOwned(userId, id);
    const type = dto.type ?? current.type;
    if (dto.accountId) await this.accounts.getOwned(userId, dto.accountId);
    if (dto.categoryId !== undefined || dto.type) {
      await this.checkCategory(userId, type, dto.categoryId ?? current.categoryId);
    }
    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        description: dto.description?.trim(),
      },
      include,
    });
    return this.serialize(updated);
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
  }

  private async getOwned(userId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new NotFoundException('Lançamento não encontrado');
    return tx;
  }

  private async checkCategory(userId: string, type: EntryType, categoryId?: string | null) {
    if (!categoryId) return;
    const category = await this.categories.getOwned(userId, categoryId);
    if (category.type !== type) {
      throw new BadRequestException(`Categoria "${category.name}" é de ${category.type === 'income' ? 'receita' : 'despesa'}`);
    }
  }

  private monthFilter(month?: string) {
    if (!month) return {};
    const [y, m] = month.split('-').map(Number);
    if (m < 1 || m > 12) throw new BadRequestException('month inválido');
    return { date: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) } };
  }

  private serialize(tx: any) {
    return { ...tx, amount: Number(tx.amount) };
  }
}
