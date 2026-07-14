import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("families")
export class Family {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ name: "invite_code", type: "varchar", length: 10, unique: true })
  inviteCode!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => User, (user) => user.family)
  members!: User[];
}
