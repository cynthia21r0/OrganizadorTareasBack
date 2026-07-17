import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getAll(@CurrentUser() user: RequestUser) {
    return this.notificationsService.getAll(user.id);
  }

  @Get('unread')
  getUnread(@CurrentUser() user: RequestUser) {
    return this.notificationsService.getUnread(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('read-all')
  markAllAsRead(@CurrentUser() user: RequestUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
