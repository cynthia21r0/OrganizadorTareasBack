import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title: string;

  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'La fecha límite no es válida' })
  dueDate: string;

  @IsEnum(TaskPriority, { message: 'Prioridad no válida' })
  priority: TaskPriority;

  @IsUUID('4', { message: 'assignedToId debe ser un UUID válido' })
  assignedToId: string;
}
