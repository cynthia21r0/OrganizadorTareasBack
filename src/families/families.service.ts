import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Family } from './entities/family.entity';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(Family)
    private readonly familiesRepository: Repository<Family>,
  ) {}

  private generateInviteCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // ej. "A1B2C3D4"
  }

  async create(name: string): Promise<Family> {
    const family = this.familiesRepository.create({
      name: name.trim(),
      inviteCode: this.generateInviteCode(),
    });
    return this.familiesRepository.save(family);
  }

  async findByInviteCode(code: string): Promise<Family> {
    const family = await this.familiesRepository.findOne({
      where: { inviteCode: code.trim().toUpperCase() },
    });
    if (!family) {
      throw new NotFoundException('Código de invitación no válido');
    }
    return family;
  }

  async findById(id: string): Promise<Family> {
    const family = await this.familiesRepository.findOne({ where: { id } });
    if (!family) throw new NotFoundException('Familia no encontrada');
    return family;
  }
}