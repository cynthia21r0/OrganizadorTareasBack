import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  send(@CurrentUser() user: RequestUser, @Body() dto: CreateMessageDto) {
    return this.chatService.send(user.id, user.familyId, dto);
  }

  @Get('family/:familyId')
  getMessages(
    @Param('familyId') familyId: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getFamilyMessages(familyId, limit ? +limit : 50);
  }
}
