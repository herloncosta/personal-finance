import { IsEnum, IsHexColor, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EntryType } from '@prisma/client';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  @IsEnum(EntryType)
  type!: EntryType;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsString()
  @MaxLength(30)
  @IsOptional()
  icon?: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @IsOptional()
  name?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsString()
  @MaxLength(30)
  @IsOptional()
  icon?: string;
}
