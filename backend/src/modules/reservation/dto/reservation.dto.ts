import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'The ID of the rescue offer to reserve from',
  })
  @IsMongoId()
  @IsNotEmpty()
  rescueOfferId: string;

  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0e',
    description: 'The ID of the customer making the reservation',
  })
  @IsMongoId()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    example: 3,
    description: 'Number of units to reserve',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateReservationDto extends PartialType(CreateReservationDto) {}
