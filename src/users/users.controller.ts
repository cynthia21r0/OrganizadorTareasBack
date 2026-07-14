import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users -> solo los integrantes de MI familia
  @Get()
  async findAll(@CurrentUser() requester: RequestUser): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAllByFamily(requester.familyId);
    return users.map((u) => UserResponseDto.fromEntity(u));
  }

  // PATCH /api/users/me/profile-picture -> actualiza mi propia foto de perfil
  @Patch('me/profile-picture')
  async updateProfilePicture(
    @CurrentUser() requester: RequestUser,
    @Body('profilePicture') profilePicture: string,
  ): Promise<UserResponseDto> {
    // Usamos el ID del token JWT del usuario para garantizar que solo pueda modificar su propia cuenta
    const updatedUser = await this.usersService.updateProfilePicture(
      requester.id, // o requester.userId (Asegúrate de usar el nombre exacto de la propiedad en tu RequestUser)
      profilePicture,
    );
    
    return UserResponseDto.fromEntity(updatedUser);
  }
}