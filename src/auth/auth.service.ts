import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { FamiliesService } from "../families/families.service";
import { UserResponseDto } from "../users/dto/user-response.dto";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

const SALT_ROUNDS = 10;

export interface AuthResult {
  accessToken: string;
  user: UserResponseDto;
}

export interface RegisterResult {
  user: UserResponseDto;
  family: { id: string; name: string; inviteCode: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly familiesService: FamiliesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResult> {
    const family = dto.inviteCode
      ? await this.familiesService.findByInviteCode(dto.inviteCode)
      : await this.familiesService.create(dto.familyName!);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      familyId: family.id,
    });

    return {
      user: UserResponseDto.fromEntity(user),
      family: {
        id: family.id,
        name: family.name,
        inviteCode: family.inviteCode,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("No existe una cuenta con ese correo");
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Contraseña incorrecta");
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      familyId: user.familyId,
      role: user.role,
    });
    return { accessToken, user: UserResponseDto.fromEntity(user) };
  }
}
