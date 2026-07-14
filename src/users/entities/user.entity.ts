import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Family } from '../../families/entities/family.entity';

export enum FamilyRole {
  PADRE = 'padre',
  MADRE = 'madre',
  HIJO = 'hijo',
  HIJA = 'hija',
  ABUELO = 'abuelo',
  ABUELA = 'abuela',
  TIO = 'tio',
  TIA = 'tia',
  OTRO = 'otro',
}

// Solo padre/madre pueden crear y asignar tareas a otros integrantes.
export function isGuardianRole(role: FamilyRole): boolean {
  return role === FamilyRole.PADRE || role === FamilyRole.MADRE;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: FamilyRole, default: FamilyRole.OTRO })
  role!: FamilyRole;

  @ManyToOne(() => Family, (family) => family.members, { eager: false })
  @JoinColumn({ name: 'family_id' })
  family!: Family;

  @Column({ name: 'family_id' })
  familyId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks!: Task[];
}