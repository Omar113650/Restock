import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'The ID of the reservation to pay for',
  })
  @IsMongoId()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({
    example: 'pm_card_visa',
    description: 'Stripe PaymentMethod ID from the frontend',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}

export class WebhookDto {
  @ApiProperty({ description: 'Raw Stripe webhook payload' })
  payload: string;

  @ApiProperty({ description: 'Stripe-Signature header value' })
  signature: string;
}

export class AttachPaymentMethodDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'The ID of the customer in the database',
  })
  @IsMongoId()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    example: 'pm_card_visa',
    description: 'The Stripe PaymentMethod ID to attach',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;
}
