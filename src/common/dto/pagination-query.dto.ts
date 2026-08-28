// import { Type } from 'class-transformer';
// import { IsInt, IsOptional, Min } from 'class-validator';
// import { ApiPropertyOptional } from '@nestjs/swagger';

// export class PaginationQueryDto {
//   @ApiPropertyOptional({ example: 1, default: 1 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   @Min(1)
//   page?: number = 1;

//   @ApiPropertyOptional({ example: 10, default: 10 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   @Min(1)
//   limit?: number = 10;
// }

// export function buildPaginationMeta(total: number, page: number, limit: number) {
//   const totalPages = Math.ceil(total / limit) || 1;

//   return {
//     total,
//     page,
//     limit,
//     totalPages,
//     hasNextPage: page < totalPages,
//     hasPreviousPage: page > 1,
//   };
// }