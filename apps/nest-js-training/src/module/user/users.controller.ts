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
import { UserService } from './users.service';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';
import { AuthGuard } from '@app/common';
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
import { UserEntity } from './user.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get all users (v1)' })
  @ApiOkResponse({
    description: 'List of users returned successfully',
    type: [UserEntity],
  })
  @Version('1')
  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Get(':id')
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
  @UseGuards(AuthGuard)
  async remove(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return this.userService.remove(userId);
  }
}
