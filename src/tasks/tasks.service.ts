import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { Task, TaskStatus } from "./entities/task.entity";
import { isGuardianRole } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { RequestUser } from "../auth/decorators/current-user.decorator";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "../notifications/entities/notification.entity";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateTaskDto, requester: RequestUser): Promise<Task> {
    if (!isGuardianRole(requester.role) && dto.assignedToId !== requester.id) {
      throw new ForbiddenException(
        "Solo el padre o la madre pueden asignar tareas a otros integrantes",
      );
    }

    const assignedUser = await this.usersService.findById(dto.assignedToId);
    if (!assignedUser || assignedUser.familyId !== requester.familyId) {
      throw new NotFoundException(
        "El integrante asignado no pertenece a tu familia",
      );
    }

    const task = this.tasksRepository.create({
      title: dto.title.trim(),
      description: dto.description?.trim() ?? "",
      dueDate: new Date(dto.dueDate),
      priority: dto.priority,
      assignedToId: dto.assignedToId,
      createdById: requester.id,
      familyId: requester.familyId,
      status: TaskStatus.PENDIENTE,
    });
    const saved = await this.tasksRepository.save(task);

    if (dto.assignedToId !== requester.id) {
      await this.notificationsService.createForUser(
        dto.assignedToId,
        NotificationType.TASK_ASSIGNED,
        `${requester.name} te asignó la tarea "${saved.title}"`,
        saved.id,
      );
    }

    return saved;
  }

  async findByUser(userId: string, requester: RequestUser): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { assignedToId: userId, familyId: requester.familyId },
      order: { dueDate: "ASC" },
    });
  }

  async findByUserAndDay(
    userId: string,
    day: string,
    requester: RequestUser,
  ): Promise<Task[]> {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    return this.tasksRepository.find({
      where: {
        assignedToId: userId,
        familyId: requester.familyId,
        dueDate: Between(start, end),
      },
      order: { dueDate: "ASC" },
    });
  }

  async findAll(requester: RequestUser): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { familyId: requester.familyId },
      order: { dueDate: "ASC" },
    });
  }

  async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException("Tarea no encontrada");
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    requester: RequestUser,
  ): Promise<Task> {
    const task = await this.findOneOrFail(id);
    this._assertSameFamilyAndCanModify(task, requester);

    if (dto.assignedToId && dto.assignedToId !== task.assignedToId) {
      if (
        !isGuardianRole(requester.role) &&
        dto.assignedToId !== requester.id
      ) {
        throw new ForbiddenException(
          "Solo el padre o la madre pueden reasignar tareas a otros integrantes",
        );
      }
    }

    Object.assign(task, {
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.description !== undefined && {
        description: dto.description.trim(),
      }),
      ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
      ...(dto.status !== undefined && { status: dto.status }),
    });

    return this.tasksRepository.save(task);
  }

  async toggleStatus(id: string, requester: RequestUser): Promise<Task> {
    const task = await this.findOneOrFail(id);
    this._assertSameFamilyAndCanModify(task, requester);

    const wasCompleted = task.status === TaskStatus.PENDIENTE;
    task.status = wasCompleted ? TaskStatus.COMPLETADA : TaskStatus.PENDIENTE;
    const saved = await this.tasksRepository.save(task);

    if (wasCompleted && task.createdById !== requester.id) {
      await this.notificationsService.createForUser(
        task.createdById,
        NotificationType.TASK_COMPLETED,
        `${requester.name} completó la tarea "${task.title}"`,
        task.id,
      );
    }

    return saved;
  }

  async remove(id: string, requester: RequestUser): Promise<void> {
    const task = await this.findOneOrFail(id);
    this._assertSameFamilyAndCanModify(task, requester);
    await this.tasksRepository.remove(task);
  }

  private _assertSameFamilyAndCanModify(task: Task, requester: RequestUser) {
    if (task.familyId !== requester.familyId) {
      throw new NotFoundException("Tarea no encontrada");
    }
    const isOwnerOrAssignee =
      task.createdById === requester.id || task.assignedToId === requester.id;
    const canModify = isOwnerOrAssignee || isGuardianRole(requester.role);
    if (!canModify) {
      throw new ForbiddenException(
        "No tienes permiso para modificar esta tarea",
      );
    }
  }
}
