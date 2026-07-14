import { User } from "../entities/user.entity";

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  role!: string;
  familyId!: string;
  profilePicture?: string;
  familyInviteCode?: string;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.role = user.role;
    dto.familyId = user.familyId;
    dto.profilePicture = user.profilePicture;

    if (user.family) {
      dto.familyInviteCode = user.family.inviteCode;
    }

    return dto;
  }
}
