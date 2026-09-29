import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Salário', type: 'income', color: '#22c55e', icon: 'briefcase' },
  { name: 'Moradia', type: 'expense', color: '#ef4444', icon: 'home' },
  { name: 'Alimentação', type: 'expense', color: '#f59e0b', icon: 'utensils' },
  { name: 'Transporte', type: 'expense', color: '#3b82f6', icon: 'car' },
  { name: 'Saúde', type: 'expense', color: '#ec4899', icon: 'heart' },
  { name: 'Lazer', type: 'expense', color: '#8b5cf6', icon: 'gamepad' },
] as const;

async function main() {
  const email = 'demo@finance.local';
  const passwordHash = await bcrypt.hash('demo1234', 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Demo', passwordHash },
  });

  for (const c of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: `default-${c.name}` },
      update: {},
      create: { id: `default-${c.name}`, ...c, isDefault: true },
    });
    // Clona para o usuário demo se ainda não tem
    const existing = await prisma.category.findFirst({
      where: { userId: user.id, name: c.name },
    });
    if (!existing) {
      await prisma.category.create({ data: { userId: user.id, ...c } });
    }
  }

  const account = await prisma.account.findFirst({ where: { userId: user.id } });
  if (!account) {
    await prisma.account.create({
      data: { userId: user.id, name: 'Conta corrente', type: 'checking', initialBalance: 1000 },
    });
  }

  console.log(`Seed ok: ${email} / demo1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
