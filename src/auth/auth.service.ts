import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  user: UserResponseDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    // Solo se crea la cuenta; el usuario debe iniciar sesión aparte para
    // obtener su accessToken (no se autologuea al registrarse).
    return UserResponseDto.fromEntity(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('No existe una cuenta con ese correo');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    return this._buildAuthResult(user.id, user.email, UserResponseDto.fromEntity(user));
  }

  private _buildAuthResult(userId: string, email: string, userDto: UserResponseDto): AuthResult {
    const accessToken = this.jwtService.sign({ sub: userId, email });
    return { accessToken, user: userDto };
  }
}