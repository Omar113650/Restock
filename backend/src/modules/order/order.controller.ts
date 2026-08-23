import {
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { OrderStatus } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'List of all orders.' })
  async findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the order' })
  @ApiResponse({ status: 200, description: 'Order found.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get('reservation/:reservationId')
  @ApiOperation({ summary: 'Get order by reservation ID' })
  @ApiParam({ name: 'reservationId', description: 'MongoDB ObjectId of the reservation' })
  @ApiResponse({ status: 200, description: 'Order linked to the reservation.' })
  @ApiResponse({ status: 404, description: 'No order found for this reservation.' })
  async findByReservationId(@Param('reservationId') reservationId: string) {
    return this.orderService.findByReservationId(reservationId);
  }

  @Patch(':id/pickup')
  @ApiOperation({
    summary: 'Mark an order as picked up',
    description: 'Sets the order status to PICKED_UP.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the order' })
  @ApiResponse({ status: 200, description: 'Order marked as picked up.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async markAsPickedUp(@Param('id') id: string) {
    return this.orderService.updateStatus(id, OrderStatus.PICKED_UP);
  }
}
