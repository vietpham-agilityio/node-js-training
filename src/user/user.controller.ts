import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { RolesGuard } from 'src/guard/authorize';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
  constructor(private usersService: UserService) { }

  @Get()
  findAll(): string {
    return 'This is basic controller';
  }

  @Get('/:userId')
  fetchUserDetails(@Param('userId') userId: string): string {
    return this.usersService.fetchUserDetails(userId);
  }

}
