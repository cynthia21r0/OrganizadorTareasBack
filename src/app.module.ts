import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'tareas_familiares'),
        entities: [User, Task],
        ssl: config.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,
        // synchronize:true es cómodo en desarrollo (crea/actualiza tablas
        // automáticamente). En producción se recomienda usar migraciones.
        synchronize: true,
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}