import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { name: 'ASC' } });
  }

  /// El primer usuario que se registra en todo el sistema queda como admin.
  async create(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    const email = data.email.toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    const total = await this.usersRepository.count();
    const role = total === 0 ? UserRole.ADMIN : UserRole.MEMBER;

    const user = this.usersRepository.create({
      name: data.name.trim(),
      email,
      passwordHash: data.passwordHash,
      role,
    });
    return this.usersRepository.save(user);
  }
}
