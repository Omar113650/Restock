import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Ahmed Ali',
    description: 'The full name of the customer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: '+201012345678',
    description: 'Customer phone number in international format (e.g. +201012345678)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+?[1-9]\d{6,19}$/, {
    message: 'phone must be a valid international phone number (e.g. +201012345678)',
  })
  phone: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  stripeCustomerId?: string;
}
