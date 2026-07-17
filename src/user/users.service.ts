import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  fetchUserDetails(userId: string): string {
    return `Details for user with ID: ${userId}`;
  }
}
