import { Controller, Get, UseGuards } from '@nestjs/common';
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
}