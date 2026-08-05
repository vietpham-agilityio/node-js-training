import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  UseFilters,
  UseInterceptors,
  Version,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

// Extension 
import { AuthGuard, RolesGuard, Roles, RpcErrorFilter } from '@app/common';

// Cache
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

// Modules
import {
  UserService,
  USER_LIST_CACHE_KEY,
  userCacheKey,
} from './users.service';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { UserEntity } from './user.entity';

// Constant
import { USER_ROLE } from '@app/constants';

// Docs
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';

// Constant
import {
  USER_MESSAGES,
  type LoginPayload,
  type CreateUserPayload,
  type UserCredentialsShape,
} from '@app/constants';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) { }

  @UseFilters(new RpcErrorFilter())
  @MessagePattern(USER_MESSAGES.VALIDATE_CREDENTIALS)
  validateCredentials(data: LoginPayload) {
    return this.userService.validateCredentials(data.email, data.password);
  }

  @UseFilters(new RpcErrorFilter())
  @MessagePattern(USER_MESSAGES.CREATE_USER)
  async createUser(data: CreateUserPayload): Promise<UserCredentialsShape> {
    const user = await this.userService.create(data);
    return { id: user.id, email: user.email, role: user.role! };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (v1)' })
  @ApiOkResponse({
    description: 'List of users returned successfully',
    type: [UserEntity],
  })
  @Version('1')
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  @UseInterceptors(CacheInterceptor)
  @CacheKey(USER_LIST_CACHE_KEY)
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @ApiBearerAuth()
  @Get(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(CacheInterceptor)
  @CacheKey((context) => userCacheKey(context.switchToHttp().getRequest().params.id))
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body(new ValidationPipe()) createUserBody: CreateUserDTO,
  ): Promise<UserEntity> {
    return this.userService.create(createUserBody);
  }

  @ApiOperation({ summary: 'Update an existing user' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to update',
    example: 1,
  })
  @ApiOkResponse({ description: 'User updated successfully', type: UserEntity })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @Put('/:userId')
  @UseGuards(AuthGuard)
  async update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ValidationPipe()) updateUserBody: UpdateUserDTO,
  ): Promise<UserEntity> {
    return this.userService.update(userId, updateUserBody);
  }


  @ApiOperation({ summary: 'Delete a user' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to delete',
    example: 1,
  })
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  async remove(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return this.userService.remove(userId);
  }
}
