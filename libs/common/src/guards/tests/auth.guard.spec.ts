import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { AuthGuard } from '../auth.guard';
import { USER_ROLE, type AuthTokenPayload } from '@app/constants';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let publicKey: string;
  let privateKey: string;

  const payload: AuthTokenPayload = {
    sub: 1,
    email: 'user@example.com',
    role: USER_ROLE.USER,
  };

  const createMockExecutionContext = (
    headers: Record<string, string> = {},
  ): ExecutionContext => {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeAll(() => {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    publicKey = keyPair.publicKey;
    privateKey = keyPair.privateKey;
  });

  beforeEach(() => {
    jwtService = new JwtService({
      privateKey,
      publicKey,
      signOptions: { algorithm: 'RS256' },
    });
    guard = new AuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true and attach the decoded payload for a valid Bearer token', async () => {
    const token = await jwtService.signAsync(payload);
    const context = createMockExecutionContext({
      authorization: `Bearer ${token}`,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest<{ user?: unknown }>();
    expect(request.user).toMatchObject({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  });

  it('should throw UnauthorizedException when the Authorization header is missing', async () => {
    const context = createMockExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when the Authorization header is missing the Bearer prefix', async () => {
    const context = createMockExecutionContext({
      authorization: 'some-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when the Authorization header has different casing', async () => {
    const token = await jwtService.signAsync(payload);
    const context = createMockExecutionContext({
      authorization: `bearer ${token}`,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for a malformed token', async () => {
    const context = createMockExecutionContext({
      authorization: 'Bearer not-a-real-jwt',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for a token signed with a different key', async () => {
    const otherKeyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const otherJwtService = new JwtService({
      privateKey: otherKeyPair.privateKey,
      signOptions: { algorithm: 'RS256' },
    });
    const token = await otherJwtService.signAsync(payload);

    const context = createMockExecutionContext({
      authorization: `Bearer ${token}`,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
