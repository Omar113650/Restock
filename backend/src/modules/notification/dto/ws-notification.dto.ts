import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubscribeNotificationsDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'ID of the user subscribing to notifications',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;
}

export class GetNotificationsDto {
  @ApiProperty({
    example: '665f1a2b3c4d5e6f7a8b9c0d',
    description: 'ID of the user requesting notifications',
  })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    required: false,
    example: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    required: false,
    example: 10,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}