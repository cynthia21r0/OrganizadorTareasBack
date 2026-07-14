import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Estado no válido' })
  status?: TaskStatus;
}
