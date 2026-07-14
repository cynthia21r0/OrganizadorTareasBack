import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: RequestUser) {
    return this.tasksService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.tasksService.findAll(user);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('day') day: string | undefined,
    @CurrentUser() user: RequestUser,
  ) {
    if (day) return this.tasksService.findByUserAndDay(userId, day, user);
    return this.tasksService.findByUser(userId, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.toggleStatus(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.remove(id, user);
  }
}