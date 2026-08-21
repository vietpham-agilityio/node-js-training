import * as crypto from 'crypto';

import * as bcrypt from 'bcrypt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import type { JwtConfig } from '../../config/jwt.config';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-codes';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import {
  BCRYPT_SALT_ROUNDS,
  REFRESH_TOKEN_BYTES,
} from './constants/auth.constants';
import type { TokenPairDto } from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  private readonly jwt: JwtConfig;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwt = this.configService.getOrThrow<JwtConfig>('jwt');
  }

  async register(dto: RegisterDto): Promise<TokenPairDto> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new AppException(
        ErrorCode.EMAIL_ALREADY_REGISTERED,
        'An account with this email already exists',
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.userRepo.save(
      this.userRepo.create({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber ?? null,
        dateOfBirth: dto.dateOfBirth ?? null,
        address: dto.address ?? null,
        role: UserRole.USER, // BR-33: never taken from the client
        isActive: true,
      }),
    );

    return this.issueTokenPair(user);
  }

  async login(dto: LoginDto): Promise<TokenPairDto> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.isActive) {
      throw new AppException(
        ErrorCode.ACCOUNT_INACTIVE,
        'This account has been deactivated',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.issueTokenPair(user);
  }

  async refresh(presentedToken: string): Promise<TokenPairDto> {
    const tokenHash = this.hashRefreshToken(presentedToken);
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    // BR-32: a revoked or expired refresh token may never issue a new access token.
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new AppException(
        ErrorCode.REFRESH_TOKEN_INVALID,
        'Refresh token is invalid or expired',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!stored.user.isActive) {
      throw new AppException(
        ErrorCode.ACCOUNT_INACTIVE,
        'This account has been deactivated',
        HttpStatus.FORBIDDEN,
      );
    }

    stored.revokedAt = new Date();
    await this.refreshTokenRepo.save(stored);

    return this.issueTokenPair(stored.user);
  }

  async logout(presentedToken: string): Promise<void> {
    const tokenHash = this.hashRefreshToken(presentedToken);
    await this.refreshTokenRepo.update(
      { tokenHash, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async issueTokenPair(user: User): Promise<TokenPairDto> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        privateKey: this.jwt.privateKey,
        algorithm: 'RS256',
        expiresIn: this.jwt.accessTokenTtlSeconds,
      },
    );

    const refreshToken = crypto
      .randomBytes(REFRESH_TOKEN_BYTES)
      .toString('hex');

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + this.jwt.refreshTokenTtlDays);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt,
      }),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwt.accessTokenTtlSeconds,
    };
  }
}
