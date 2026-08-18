import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { BatchService } from './batch.service';

import { CreateBatchDto, UpdateBatchDto } from './dto/batch.dto';

@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  async createBatch(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.createBatch(createBatchDto);
  }

  @Get()
  async findAll() {
    return this.batchService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Patch(':id')
  async updateBatch(
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchService.updateBatch(id, updateBatchDto);
  }

  @Delete(':id')
  async deleteBatch(@Param('id') id: string) {
    return this.batchService.deleteBatch(id);
  }
}