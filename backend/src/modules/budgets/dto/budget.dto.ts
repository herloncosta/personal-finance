import { Type } from 'class-transformer';
import { IsNotEmpty, IsPositive, IsString, Matches } from 'class-validator';

export class UpsertBudgetDto {
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @Matches(/^\d{4}-\d{2}$/, { message: 'month deve ser YYYY-MM' })
  month!: string;

  @IsPositive()
  @Type(() => Number)
  limitAmount!: number;
}
