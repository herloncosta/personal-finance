import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { accessSecret, refreshSecret } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { name: dto.name.trim(), email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    // Clona categorias padrão para o novo usuário (isolamento por user_id).
    const defaults = await this.prisma.category.findMany({ where: { isDefault: true } });
    if (defaults.length > 0) {
      await this.prisma.category.createMany({
        data: defaults.map((d) => ({
          userId: user.id,
          name: d.name,
          type: d.type,
          color: d.color,
          icon: d.icon,
        })),
        skipDuplicates: true,
      });
    }

    return { user, ...this.sign(user.id, user.email) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const safe = { id: user.id, name: user.name, email: user.email };
    return { user: safe, ...this.sign(user.id, user.email) };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh ausente');
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: refreshSecret() });
    } catch {
      throw new UnauthorizedException('Refresh inválido ou expirado');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return { user, ...this.sign(user.id, user.email) };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }

  private sign(sub: string, email: string) {
    return {
      accessToken: this.jwt.sign({ sub, email }, { secret: accessSecret(), expiresIn: '15m' }),
      refreshToken: this.jwt.sign({ sub }, { secret: refreshSecret(), expiresIn: '7d' }),
    };
  }
}
