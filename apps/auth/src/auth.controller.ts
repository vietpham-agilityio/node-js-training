import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AUTH_MESSAGES,
  type LoginPayload,
  type RegisterPayload,
} from '@app/constants';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_MESSAGES.LOGIN)
  login(data: LoginPayload) {
    return this.authService.login(data.email, data.password);
  }

  @MessagePattern(AUTH_MESSAGES.REGISTER)
  register(data: RegisterPayload) {
    return this.authService.register(data);
  }
}
