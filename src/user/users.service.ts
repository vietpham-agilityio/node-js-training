import { Injectable, Param } from '@nestjs/common';

@Injectable()
export class UserService {
  fetchUserDetails(@Param('userId') userId: string): string {
    return `Details for user with ID: ${userId}`;
  }
}
