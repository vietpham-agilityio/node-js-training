import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(): string {
    return 'This is basic controller';
  }

  @Get('/:userId')
  fetchUserDetails(@Param('userId') userId: string): string {
    return `Details for user with ID: ${userId}`;
  }
}
