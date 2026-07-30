import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthProxyService } from '../services';
import { LoginDTO, RegisterDTO } from 'apps/auth/src/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthProxyController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  @ApiOperation({ summary: 'Log in and receive a JWT access token' })
  @ApiBody({ type: LoginDTO })
  @ApiOkResponse({ description: 'Login successful' })
  @Post('login')
  login(@Body(new ValidationPipe()) body: LoginDTO) {
    return this.authProxyService.login(body.email, body.password);
  }

  @ApiOperation({
    summary: 'Register a new account and receive a JWT access token',
  })
  @ApiBody({ type: RegisterDTO })
  @ApiCreatedResponse({ description: 'Account created successfully' })
  @Post('register')
  register(@Body(new ValidationPipe()) body: RegisterDTO) {
    return this.authProxyService.register(body);
  }
}
