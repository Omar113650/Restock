import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'The ID of the reservation this order belongs to',
  })
  @IsMongoId()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({
    example: 300,
    description: 'Total price of the order in cents/piasters',
  })
  @IsInt()
  @Min(1)
  totalAmount: number;
}
