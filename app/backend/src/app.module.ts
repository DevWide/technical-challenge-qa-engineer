import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { AiModule } from './ai/ai.module';
import { Task } from './tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? '/app/data/smart-todo.db',
      entities: [Task],
      synchronize: true,
    }),
    TasksModule,
    AiModule,
  ],
})
export class AppModule {}
