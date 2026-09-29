import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { accessSecret } from './auth.constants';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export interface RequestUser {
  id: string;
  email: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Token ausente');

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; jti: string }>(token, {
        secret: accessSecret(),
      });
      if (!payload.jti) throw new UnauthorizedException('Token inválido ou expirado');
      const revoked = await this.prisma.revokedToken.findUnique({ where: { jti: payload.jti } });
      if (revoked) throw new UnauthorizedException('Token revogado');
      req.user = { id: payload.sub, email: payload.email } satisfies RequestUser;
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
