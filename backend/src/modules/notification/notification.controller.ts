import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: 'Notification created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'List of all notifications.' })
  async findAll() {
    return this.notificationService.findAll();
  }

  @Get('recipient/:recipientId')
  @ApiOperation({ summary: 'Get notifications for a specific recipient' })
  @ApiParam({ name: 'recipientId', description: 'MongoDB ObjectId of the recipient customer' })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: String,
    enum: ['true', 'false'],
    description: 'Filter notifications by read status. Omit to return all.',
  })
  @ApiResponse({ status: 200, description: 'Notifications for the recipient.' })
  @ApiResponse({ status: 404, description: 'Recipient not found.' })
  async findByRecipient(
    @Param('recipientId') recipientId: string,
    @Query('isRead') isRead?: string,
  ) {
    const isReadBool = isRead === undefined ? undefined : isRead === 'true';
    return this.notificationService.findByRecipient(recipientId, isReadBool);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the notification' })
  @ApiResponse({ status: 200, description: 'Notification marked as read.' })
  @ApiResponse({ status: 404, description: 'Notification not found.' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('recipient/:recipientId/read-all')
  @ApiOperation({ summary: 'Mark all notifications for a recipient as read' })
  @ApiParam({ name: 'recipientId', description: 'MongoDB ObjectId of the recipient customer' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read.' })
  @ApiResponse({ status: 404, description: 'Recipient not found.' })
  async markAllAsRead(@Param('recipientId') recipientId: string) {
    return this.notificationService.markAllAsRead(recipientId);
  }
}
