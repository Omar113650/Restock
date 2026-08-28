import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { OfferStatus } from '@prisma/client';

export class CreateRescueOfferDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'MongoDB ObjectId of the batch this offer belongs to',
  })
  @IsMongoId()
  @IsNotEmpty()
  batchId: string;

  @ApiProperty({
    example: 100,
    description: 'Original price in smallest currency unit (e.g. piasters). Must be ≥ 1.',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  originalPrice: number;

  @ApiProperty({
    example: 60,
    description: 'Discounted rescue price. Must be ≥ 1.',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  discountPrice: number;

  @ApiProperty({
    example: 20,
    description: 'Number of units available for reservation. Must be ≥ 1.',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantityAvailable: number;
}

export class UpdateRescueOfferDto extends PartialType(CreateRescueOfferDto) {
  @ApiProperty({
    enum: OfferStatus,
    enumName: 'OfferStatus',
    example: OfferStatus.ACTIVE,
    description: 'Current status of the rescue offer',
    required: false,
  })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
