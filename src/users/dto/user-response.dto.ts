import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    return dto;
  }
}
