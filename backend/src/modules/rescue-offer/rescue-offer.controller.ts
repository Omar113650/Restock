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
import { RescueOfferService } from './rescue-offer.service';
import { CreateRescueOfferDto, UpdateRescueOfferDto } from './dto/rescue-offer.dto';

@ApiTags('Rescue Offers')
@Controller('rescue-offers')
export class RescueOfferController {
  constructor(private readonly rescueOfferService: RescueOfferService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new rescue offer for a batch' })
  @ApiBody({ type: CreateRescueOfferDto })
  @ApiResponse({ status: 201, description: 'Rescue offer created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async createRescueOffer(@Body() createRescueOfferDto: CreateRescueOfferDto) {
    return this.rescueOfferService.createRescueOffer(createRescueOfferDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rescue offers' })
  @ApiResponse({ status: 200, description: 'List of all rescue offers.' })
  async findAll() {
    return this.rescueOfferService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active rescue offers' })
  @ApiResponse({ status: 200, description: 'List of active rescue offers.' })
  async findActiveOffers() {
    return this.rescueOfferService.findActiveOffers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rescue offer by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the rescue offer' })
  @ApiResponse({ status: 200, description: 'Rescue offer found.' })
  @ApiResponse({ status: 404, description: 'Rescue offer not found.' })
  async findOne(@Param('id') id: string) {
    return this.rescueOfferService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a rescue offer by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the rescue offer' })
  @ApiBody({ type: UpdateRescueOfferDto })
  @ApiResponse({ status: 200, description: 'Rescue offer updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 404, description: 'Rescue offer not found.' })
  async updateRescueOffer(
    @Param('id') id: string,
    @Body() updateRescueOfferDto: UpdateRescueOfferDto,
  ) {
    return this.rescueOfferService.updateRescueOffer(id, updateRescueOfferDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a rescue offer by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the rescue offer' })
  @ApiResponse({ status: 204, description: 'Rescue offer deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Rescue offer not found.' })
  async deleteRescueOffer(@Param('id') id: string) {
    return this.rescueOfferService.deleteRescueOffer(id);
  }
}
