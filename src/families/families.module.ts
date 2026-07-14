import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Family } from './entities/family.entity';
import { FamiliesService } from './families.service';

@Module({
  imports: [TypeOrmModule.forFeature([Family])],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}