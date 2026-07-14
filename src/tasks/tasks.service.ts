import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  // CREATE
  async create(dto: CreateTaskDto, createdById: string): Promise<Task> {
    const task = this.tasksRepository.create({
      title: dto.title.trim(),
      description: dto.description?.trim() ?? '',
      dueDate: new Date(dto.dueDate),
      priority: dto.priority,
      assignedToId: dto.assignedToId,
      createdById,
      status: TaskStatus.PENDIENTE,
    });
    return this.tasksRepository.save(task);
  }

  // READ - tareas asignadas a un usuario
  async findByUser(userId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assignedToId: userId },
      order: { dueDate: 'ASC' },
    });
  }

  // READ - tareas de un usuario en un día específico (para el filtro por día)
  async findByUserAndDay(userId: string, day: string): Promise<Task[]> {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    return this.tasksRepository.find({
      where: { assignedToId: userId, dueDate: Between(start, end) },
      order: { dueDate: 'ASC' },
    });
  }

  // READ - todas las tareas de la familia (panel de administrador)
  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({ order: { dueDate: 'ASC' } });
  }

  async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  // UPDATE
  async update(id: string, dto: UpdateTaskDto, requesterId: string): Promise<Task> {
    const task = await this.findOneOrFail(id);
    this._assertCanModify(task, requesterId);

    Object.assign(task, {
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
      ...(dto.status !== undefined && { status: dto.status }),
    });

    return this.tasksRepository.save(task);
  }

  // UPDATE - alterna pendiente/completada (tap rápido en la tarjeta)
  async toggleStatus(id: string, requesterId: string): Promise<Task> {
    const task = await this.findOneOrFail(id);
    this._assertCanModify(task, requesterId);

    task.status =
      task.status === TaskStatus.PENDIENTE ? TaskStatus.COMPLETADA : TaskStatus.PENDIENTE;
    return this.tasksRepository.save(task);
  }

  // DELETE
  async remove(id: string, requesterId: string): Promise<void> {
    const task = await this.findOneOrFail(id);
    this._assertCanModify(task, requesterId);
    await this.tasksRepository.remove(task);
  }

  // Solo quien creó la tarea o a quien está asignada puede editarla/eliminarla.
  private _assertCanModify(task: Task, requesterId: string) {
    if (task.createdById !== requesterId && task.assignedToId !== requesterId) {
      throw new ForbiddenException('No tienes permiso para modificar esta tarea');
    }
  }
}
