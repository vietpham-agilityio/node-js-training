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
  Headers,
  Res,
} from '@nestjs/common';

// Docs
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

// Extensions
import type { Response } from 'express';

// Libs
import { AuthGuard, RolesGuard, Roles } from '@app/common';
import { USER_ROLE } from '@app/constants';

// Module
import { UserProxyService } from '../services';
import { CreateUserDTO, UpdateUserDTO } from 'apps/user/src/user.dto';
import { UserEntity } from 'apps/user/src/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserProxyController {
  constructor(private readonly userProxyService: UserProxyService) { }

  @ApiOperation({ summary: 'Get all users (v1)' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'List of users returned successfully',
    type: [UserEntity],
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @Version('1')
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
  findAll(
    @Headers('authorization') authorization?: string,
    @Res({ passthrough: true }) response?: Response,
  ): Promise<UserEntity[]> {
    return this.userProxyService.findAll(authorization, response);
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID of the user to fetch', example: 1 })
  @ApiOkResponse({ description: 'User returned successfully', type: UserEntity })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication token',
  })
  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization?: string,
    @Res({ passthrough: true }) response?: Response,
  ): Promise<UserEntity> {
    return this.userProxyService.findOne(id, authorization, response);
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
    @Headers('authorization') authorization?: string,
  ): Promise<UserEntity> {
    return this.userProxyService.create(createUserBody, authorization);
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
    @Headers('authorization') authorization?: string,
  ): Promise<UserEntity> {
    return this.userProxyService.update(userId, updateUserBody, authorization);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN)
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
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Headers('authorization') authorization?: string,
  ): Promise<void> {
    return this.userProxyService.remove(userId, authorization);
  }
}
