import { Controller, Get, Patch, Body, UseGuards, NotFoundException } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CurrentUser,
  RequestUser,
} from "../auth/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto/user-response.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
async findMe(@CurrentUser() requester: RequestUser): Promise<UserResponseDto> {
  const user = await this.usersService.findById(requester.id);
  if (!user) {
    throw new NotFoundException("Usuario no encontrado");
  }
  return UserResponseDto.fromEntity(user);
}

  @Get()
  async findAll(
    @CurrentUser() requester: RequestUser,
  ): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAllByFamily(requester.familyId);
    return users.map((u) => UserResponseDto.fromEntity(u));
  }

  @Patch("me/profile-picture")
  async updateProfilePicture(
    @CurrentUser() requester: RequestUser,
    @Body("profilePicture") profilePicture: string,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.updateProfilePicture(
      requester.id,
      profilePicture,
    );
    return UserResponseDto.fromEntity(updatedUser);
  }

  @Patch("me")
async updateProfile(
  @CurrentUser() requester: RequestUser,
  @Body() dto: UpdateProfileDto,
): Promise<UserResponseDto> {
  await this.usersService.updateProfile(requester.id, dto);
  const updatedUser = await this.usersService.findById(requester.id);
  if (!updatedUser) {
    throw new NotFoundException("Usuario no encontrado");
  }
  return UserResponseDto.fromEntity(updatedUser);
}
}
