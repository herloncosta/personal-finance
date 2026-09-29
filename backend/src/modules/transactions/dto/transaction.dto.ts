import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EntryType } from '@prisma/client';

export class CreateTransactionDto {
  @IsEnum(EntryType)
  type!: EntryType;

  @IsPositive()
  @Type(() => Number)
  amount!: number;

  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  description!: string;

  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}

export class UpdateTransactionDto {
  @IsEnum(EntryType)
  @IsOptional()
  type?: EntryType;

  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string | null;
}

export class ListTransactionsQuery {
  @Matches(/^\d{4}-\d{2}$/, { message: 'month deve ser YYYY-MM' })
  @IsOptional()
  month?: string;

  @IsEnum(EntryType)
  @IsOptional()
  type?: EntryType;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number;
}
