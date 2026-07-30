import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import {
  USER_MESSAGES,
  USER_ROLE,
  type UserCredentialsShape,
  type RegisterPayload,
  type LoginResponse,
  type AuthTokenPayload,
} from '@app/constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await firstValueFrom(
      this.userClient.send<UserCredentialsShape>(
        USER_MESSAGES.VALIDATE_CREDENTIALS,
        { email, password },
      ),
    );

    return this.issueToken(user);
  }

  async register(data: RegisterPayload): Promise<LoginResponse> {
    const user = await firstValueFrom(
      this.userClient.send<UserCredentialsShape>(USER_MESSAGES.CREATE_USER, {
        ...data,
        role: USER_ROLE.USER,
      }),
    );

    return this.issueToken(user);
  }

  private async issueToken(user: UserCredentialsShape): Promise<LoginResponse> {
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
