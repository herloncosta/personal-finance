import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

const prismaMock = () => ({
  user: { findUnique: jest.fn(), create: jest.fn() },
  category: { findMany: jest.fn().mockResolvedValue([]), createMany: jest.fn() },
});

describe('AuthService (sem banco — prisma mockado)', () => {
  const make = () => new AuthService(prismaMock() as any, new JwtService());

  it('register: cria usuário com senha hasheada e retorna tokens', async () => {
    const prisma: any = prismaMock();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation((args: any) =>
      Promise.resolve({ id: 'u1', name: args.data.name, email: args.data.email }),
    );
    const svc = new AuthService(prisma, new JwtService());

    const out = await svc.register({ name: 'Ana', email: 'ANA@x.com', password: 'segredo123' });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: 'ana@x.com' }) }),
    );
    const hash = prisma.user.create.mock.calls[0][0].data.passwordHash;
    expect(hash).not.toBe('segredo123');
    expect(await bcrypt.compare('segredo123', hash)).toBe(true);
    expect(out.accessToken).toBeTruthy();
    expect(out.refreshToken).toBeTruthy();
  });

  it('register: e-mail duplicado → 409', async () => {
    const prisma: any = prismaMock();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    const svc = new AuthService(prisma, new JwtService());
    await expect(
      svc.register({ name: 'A', email: 'a@x.com', password: 'segredo123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login: senha errada → 401; refresh com token válido → novo par', async () => {
    const prisma: any = prismaMock();
    const hash = await bcrypt.hash('correta123', 4);
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', name: 'A', email: 'a@x.com', passwordHash: hash });
    const svc2 = new AuthService(prisma, new JwtService());

    await expect(svc2.login({ email: 'a@x.com', password: 'errada' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    const logged = await svc2.login({ email: 'a@x.com', password: 'correta123' });
    expect(logged.user).toEqual({ id: 'u1', name: 'A', email: 'a@x.com' });

    const refreshed = await svc2.refresh(logged.refreshToken);
    expect(refreshed.accessToken).toBeTruthy();
  });

  it('refresh: token inválido → 401', async () => {
    const svc = make();
    await expect(svc.refresh('invalido')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(svc.refresh(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
