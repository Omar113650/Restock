
import { ApiProperty ,PartialType} from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Milk',
    description: 'The name of the product',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'liter',
    description: 'The unit used to measure the product',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
