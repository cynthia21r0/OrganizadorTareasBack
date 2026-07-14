import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, FamilyRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['family'] // <-- Relación agregada
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id },
      relations: ['family'] // <-- Relación agregada
    });
  }

  // Ahora filtra por familia (multi-familia)
  async findAllByFamily(familyId: string): Promise<User[]> {
    return this.usersRepository.find({ 
      where: { familyId }, 
      order: { name: 'ASC' },
      relations: ['family'] // <-- Relación agregada
    });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: FamilyRole;
    familyId: string;
  }): Promise<User> {
    const email = data.email.toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    const user = this.usersRepository.create({
      name: data.name.trim(),
      email,
      passwordHash: data.passwordHash,
      role: data.role,
      familyId: data.familyId,
    });
    return this.usersRepository.save(user);
  }

  // NUEVO MÉTODO PARA ACTUALIZAR LA FOTO
  async updateProfilePicture(id: string, base64Image: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.profilePicture = base64Image;
    return this.usersRepository.save(user);
  }
}