import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const createMockExecutionContext = (
    headers: Record<string, string> = {},
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    guard = new AuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when the Authorization header has a Bearer token', () => {
    const context = createMockExecutionContext({
      authorization: 'Bearer mock-token',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true regardless of the token value, since it only checks presence', () => {
    const context = createMockExecutionContext({
      authorization: 'Bearer any-token-value',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when the Authorization header is missing', () => {
    const context = createMockExecutionContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the Authorization header is missing the Bearer prefix', () => {
    const context = createMockExecutionContext({
      authorization: 'mock-token',
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the Authorization header has different casing', () => {
    const context = createMockExecutionContext({
      authorization: 'bearer mock-token',
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the Authorization header has extra whitespace', () => {
    const context = createMockExecutionContext({
      authorization: 'Bearer  mock-token',
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
