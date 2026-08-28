import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'The customer (recipient) ID',
  })
  @IsMongoId()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.RESERVATION_CONFIRMED,
    description: 'Type of notification',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    example: 'Your reservation has been confirmed.',
    description: 'Notification message body',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    required: false,
    description: 'Related order ID (optional)',
  })
  @IsMongoId()
  @IsOptional()
  relatedOrderId?: string;

  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    required: false,
    description: 'Related batch ID (optional)',
  })
  @IsMongoId()
  @IsOptional()
  relatedBatchId?: string;
}
