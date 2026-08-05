import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';

// Common
import { HttpProxyService } from '@app/common';

// Constants
import { USER_BASE_URL, API_ENDPOINT } from '@app/constants/shared/router/route';
import { CreateUserDTO, UpdateUserDTO } from 'apps/user/src/user.dto';

// Entities
import { UserEntity } from 'apps/user/src/user.entity';

@Injectable()
export class UserProxyService extends HttpProxyService {
  protected readonly serviceName = 'User';

  constructor(private readonly httpService: HttpService) {
    super();
  }

  create(body: CreateUserDTO, authorization?: string): Promise<UserEntity> {
    return this.forward(
      this.httpService.post(
        `${USER_BASE_URL}${API_ENDPOINT.USER}`,
        body,
        this.withAuth(authorization),
      ),
    );
  }

  findAll(authorization?: string, httpResponse?: Response): Promise<UserEntity[]> {
    return this.forward(
      this.httpService.get(
        `${USER_BASE_URL}${API_ENDPOINT.USER}`,
        this.withAuth(authorization),
      ),
      httpResponse,
    );
  }

  findOne(
    id: number,
    authorization?: string,
    httpResponse?: Response,
  ): Promise<UserEntity> {
    return this.forward(
      this.httpService.get(
        `${USER_BASE_URL}${API_ENDPOINT.USER}/${id}`,
        this.withAuth(authorization),
      ),
      httpResponse,
    );
  }

  update(
    userId: number,
    body: UpdateUserDTO,
    authorization?: string,
  ): Promise<UserEntity> {
    return this.forward(
      this.httpService.put(
        `${USER_BASE_URL}${API_ENDPOINT.USER}/${userId}`,
        body,
        this.withAuth(authorization),
      ),
    );
  }

  remove(userId: number, authorization?: string): Promise<void> {
    return this.forward(
      this.httpService.delete(
        `${USER_BASE_URL}${API_ENDPOINT.USER}/${userId}`,
        this.withAuth(authorization),
      ),
    );
  }
}
