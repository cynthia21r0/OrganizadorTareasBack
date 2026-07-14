import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskPriority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

export enum TaskStatus {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true, default: '' })
  description: string;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate: Date;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIA })
  priority: TaskPriority;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDIENTE })
  status: TaskStatus;

  @ManyToOne(() => User, (user) => user.assignedTasks, { eager: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ name: 'assigned_to_id' })
  assignedToId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
