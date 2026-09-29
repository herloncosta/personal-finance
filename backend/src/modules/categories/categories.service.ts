import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.category.findMany({ where: { userId }, orderBy: [{ type: 'asc' }, { name: 'asc' }] });
  }

  create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: { userId, ...dto, name: dto.name.trim() } });
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.getOwned(userId, id);
    return this.prisma.category.update({ where: { id }, data: { ...dto, name: dto.name?.trim() } });
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id);
    // Transações vinculadas têm category_id anulado (onDelete: SetNull); orçamentos são removidos (Cascade).
    await this.prisma.category.delete({ where: { id } });
  }

  async getOwned(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }
}
