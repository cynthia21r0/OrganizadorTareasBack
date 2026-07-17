import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "./entities/task.entity";
import { UsersModule } from "../users/users.module";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [TypeOrmModule.forFeature([Task]), UsersModule, NotificationsModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
