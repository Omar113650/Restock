import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/reservation.dto';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new reservation',
    description: 'Reserves units from a rescue offer for a customer. Reduces available quantity atomically.',
  })
  @ApiBody({ type: CreateReservationDto })
  @ApiResponse({ status: 201, description: 'Reservation created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error or insufficient stock.' })
  @ApiResponse({ status: 404, description: 'Rescue offer or customer not found.' })
  async createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationService.createReservation(createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiResponse({ status: 200, description: 'List of all reservations.' })
  async findAll() {
    return this.reservationService.findAll();
  }

  @Post('trigger-expiry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger expired-reservation cleanup',
    description: 'Runs the expiry job on-demand (normally executed by the scheduler). Marks stale reservations as EXPIRED and restores stock.',
  })
  @ApiResponse({ status: 200, description: 'Expiry job executed successfully.' })
  async triggerExpiry() {
    return this.reservationService.handleExpiredReservations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the reservation' })
  @ApiResponse({ status: 200, description: 'Reservation found.' })
  @ApiResponse({ status: 404, description: 'Reservation not found.' })
  async findOne(@Param('id') id: string) {
    return this.reservationService.findOne(id);
  }
}
