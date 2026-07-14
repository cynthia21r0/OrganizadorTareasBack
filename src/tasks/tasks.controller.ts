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

  // POST /api/tasks
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: RequestUser) {
    return this.tasksService.create(dto, user.id);
  }

  // GET /api/tasks  -> todas las tareas de la familia (pantalla "Familia")
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  // GET /api/tasks/user/:userId?day=2026-07-13  -> "Mis tareas" (+ filtro por día)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query('day') day?: string) {
    if (day) {
      return this.tasksService.findByUserAndDay(userId, day);
    }
    return this.tasksService.findByUser(userId);
  }

  // PATCH /api/tasks/:id -> edición general
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.tasksService.update(id, dto, user.id);
  }

  // PATCH /api/tasks/:id/toggle -> cambio rápido de estado
  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.toggleStatus(id, user.id);
  }

  // DELETE /api/tasks/:id
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.tasksService.remove(id, user.id);
  }
}
