import { ApiProperty, PartialType } from '@nestjs/swagger';
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
    description: 'The ID of the product',
  })
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 20,
    description: 'The quantity of the batch',
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: '2026-09-15T00:00:00.000Z',
    description: 'The expiry date of the batch',
  })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({
    enum: RiskLevel,
    example: RiskLevel.NORMAL,
    description: 'The risk level of the batch',
  })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;
}

export class UpdateBatchDto extends PartialType(CreateBatchDto) {}

