import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CurrentUser,
  RequestUser,
} from "../auth/decorators/current-user.decorator";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto/user-response.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
