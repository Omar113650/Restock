import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsMongoId,
  Min,
} from 'class-validator';
import { RiskLevel } from '@prisma/client';

export class CreateBatchDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'MongoDB ObjectId of the product this batch belongs to',
  })
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 20,
    description: 'Total quantity of items in the batch (must be ≥ 1)',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: '2026-09-15T00:00:00.000Z',
    description: 'ISO 8601 expiry date of the batch',
  })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({
    enum: RiskLevel,
    enumName: 'RiskLevel',
    example: RiskLevel.NORMAL,
    description: 'Risk level assigned to the batch based on expiry proximity',
  })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;
}

export class UpdateBatchDto extends PartialType(CreateBatchDto) {}
