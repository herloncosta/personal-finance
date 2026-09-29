import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const [accounts, sums] = await Promise.all([
      this.prisma.account.findMany({ where: { userId }, orderBy: { name: 'asc' } }),
      this.prisma.transaction.groupBy({
        by: ['accountId', 'type'],
        where: { userId },
        _sum: { amount: true },
      }),
    ]);
    const byAccount = new Map<string, number>();
    for (const s of sums) {
      const v = Number(s._sum.amount ?? 0) * (s.type === 'income' ? 1 : -1);
      byAccount.set(s.accountId, (byAccount.get(s.accountId) ?? 0) + v);
    }
    return accounts.map((a) => ({
      ...a,
      initialBalance: Number(a.initialBalance),
      balance: Number(a.initialBalance) + (byAccount.get(a.id) ?? 0),
    }));
  }

  create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: { userId, name: dto.name.trim(), type: dto.type ?? 'checking', initialBalance: dto.initialBalance ?? 0 },
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.getOwned(userId, id);
    return this.prisma.account.update({ where: { id }, data: { ...dto, name: dto.name?.trim() } });
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id);
    const used = await this.prisma.transaction.count({ where: { accountId: id, userId } });
    if (used > 0) throw new ConflictException('Conta possui lançamentos e não pode ser excluída');
    await this.prisma.account.delete({ where: { id } });
  }

  async getOwned(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({ where: { id, userId } });
    if (!account) throw new NotFoundException('Conta não encontrada');
    return account;
  }
}
