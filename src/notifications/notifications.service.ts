import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async createForUser(
    userId: string,
    type: NotificationType,
    message: string,
    taskId?: string,
  ): Promise<Notification> {
    return this.repo.save(
      this.repo.create({ userId, type, message, taskId: taskId ?? null }),
    );
  }

  async getUnread(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getAll(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }
}
