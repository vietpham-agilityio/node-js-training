import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @Get()
  findAll(): string {
    return 'This is basic controller';
  }

  @Get('/:userId')
  fetchUserDetails(@Param('userId') userId: string): string {
    return this.usersService.fetchUserDetails(userId);
  }
}
