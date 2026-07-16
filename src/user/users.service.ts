import { Injectable, Param } from '@nestjs/common';

@Injectable()
export class UsersService {
  fetchUserDetails(@Param('userId') userId: string): string {
    return `Details for user with ID: ${userId}`;
  }
}
