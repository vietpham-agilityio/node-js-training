import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { USER_ROLE, type AuthTokenPayload } from '@app/constants';

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  const createMockExecutionContext = (
    user?: AuthTokenPayload,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('allows the request through when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockExecutionContext({
      sub: 1,
      email: 'user@example.com',
      role: USER_ROLE.USER,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows the request through when the user has one of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([USER_ROLE.ADMIN, USER_ROLE.MERCHANT]);
    const context = createMockExecutionContext({
      sub: 1,
      email: 'merchant@example.com',
      role: USER_ROLE.MERCHANT,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when the user role is not among the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([USER_ROLE.ADMIN]);
    const context = createMockExecutionContext({
      sub: 1,
      email: 'user@example.com',
      role: USER_ROLE.USER,
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no authenticated user on the request', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([USER_ROLE.ADMIN]);
    const context = createMockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
