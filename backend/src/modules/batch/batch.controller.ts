import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { BatchService } from './batch.service';
import { CreateBatchDto, UpdateBatchDto } from './dto/batch.dto';

@ApiTags('Batches')
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new batch' })
  @ApiBody({ type: CreateBatchDto })
  @ApiResponse({ status: 201, description: 'Batch created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async createBatch(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.createBatch(createBatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all batches' })
  @ApiResponse({ status: 200, description: 'List of all batches.' })
  async findAll() {
    return this.batchService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a batch by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the batch' })
  @ApiResponse({ status: 200, description: 'Batch found.' })
  @ApiResponse({ status: 404, description: 'Batch not found.' })
  async findOne(@Param('id') id: string) {
    return this.batchService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a batch by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the batch' })
  @ApiBody({ type: UpdateBatchDto })
  @ApiResponse({ status: 200, description: 'Batch updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 404, description: 'Batch not found.' })
  async updateBatch(
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchService.updateBatch(id, updateBatchDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a batch by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the batch' })
  @ApiResponse({ status: 204, description: 'Batch deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Batch not found.' })
  async deleteBatch(@Param('id') id: string) {
    return this.batchService.deleteBatch(id);
  }
}