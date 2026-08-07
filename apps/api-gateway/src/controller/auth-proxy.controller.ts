import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';

// Docs
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

// Module
import { AuthProxyService } from '../services';
import { AuthProxyModule } from '../modules';
import { LoginDTO, RegisterDTO } from 'apps/auth/src/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthProxyController {
  private authProxyServicePromise?: Promise<AuthProxyService>;

  constructor(private readonly lazyModuleLoader: LazyModuleLoader) {}

  private getAuthProxyService(): Promise<AuthProxyService> {
    if (!this.authProxyServicePromise) {
      this.authProxyServicePromise = this.lazyModuleLoader
        .load(() => AuthProxyModule)
        .then((moduleRef) =>
          moduleRef.get(AuthProxyService, { strict: false }),
        );
    }
    return this.authProxyServicePromise;
  }

  @ApiOperation({ summary: 'Log in and receive a JWT access token' })
  @ApiBody({ type: LoginDTO })
  @ApiOkResponse({ description: 'Login successful' })
  @Post('login')
  async login(@Body(new ValidationPipe()) body: LoginDTO) {
    const authProxyService = await this.getAuthProxyService();
    return authProxyService.login(body.email, body.password);
  }

  @ApiOperation({
    summary: 'Register a new account and receive a JWT access token',
  })
  @ApiBody({ type: RegisterDTO })
  @ApiCreatedResponse({ description: 'Account created successfully' })
  @Post('register')
  async register(@Body(new ValidationPipe()) body: RegisterDTO) {
    const authProxyService = await this.getAuthProxyService();
    return authProxyService.register(body);
  }
}
