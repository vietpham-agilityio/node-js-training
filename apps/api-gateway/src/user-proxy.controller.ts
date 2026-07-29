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
  Version,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserProxyService } from './user-proxy.service';
import { AuthGuard } from '@app/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateUserDTO, UpdateUserDTO } from 'apps/user/src/user.dto';
import { UserEntity } from 'apps/user/src/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserProxyController {
  constructor(private readonly userProxyService: UserProxyService) {}

  @ApiOperation({ summary: 'Get all users (v1)' })
  @ApiOkResponse({
    description: 'List of users returned successfully',
    type: [UserEntity],
  })
  @Version('1')
  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.userProxyService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'ID of the user to fetch', example: 1 })
  @ApiOkResponse({ description: 'User returned successfully', type: UserEntity })
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.userProxyService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateUserDTO })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body(new ValidationPipe()) createUserBody: CreateUserDTO,
  ): Promise<UserEntity> {
    return this.userProxyService.create(createUserBody);
  }

  @ApiOperation({ summary: 'Update an existing user' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to update',
    example: 1,
  })
  @ApiBody({ type: UpdateUserDTO })
  @ApiOkResponse({ description: 'User updated successfully', type: UserEntity })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @Put('/:userId')
  @UseGuards(AuthGuard)
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body(new ValidationPipe()) updateUserBody: UpdateUserDTO,
  ): Promise<UserEntity> {
    return this.userProxyService.update(userId, updateUserBody);
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
  @UseGuards(AuthGuard)
  remove(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return this.userProxyService.remove(userId);
  }
}
