import { ConflictException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RpcErrorFilter } from '../rpc-error.filter';

describe('RpcErrorFilter', () => {
  const filter = new RpcErrorFilter();

  async function catchAndReject(exception: unknown) {
    return firstValueFrom(filter.catch(exception, {} as never)).catch(
      (err: unknown) => err,
    );
  }

  it('converts an HttpException into a {status, message} payload', async () => {
    const err = await catchAndReject(
      new ConflictException('Email vion@gmail.com is already registered'),
    );

    expect(err).toEqual({
      status: HttpStatus.CONFLICT,
      message: 'Email vion@gmail.com is already registered',
    });
  });

  it('converts an UnauthorizedException into a {status, message} payload', async () => {
    const err = await catchAndReject(
      new UnauthorizedException('Invalid email or password'),
    );

    expect(err).toEqual({
      status: HttpStatus.UNAUTHORIZED,
      message: 'Invalid email or password',
    });
  });

  it('unwraps an RpcException carrying a {status, message} payload', async () => {
    const err = await catchAndReject(
      new RpcException({ status: HttpStatus.CONFLICT, message: 'duplicate' }),
    );

    expect(err).toEqual({ status: HttpStatus.CONFLICT, message: 'duplicate' });
  });

  it('forwards an already-shaped {status, message} error unchanged', async () => {
    const err = await catchAndReject({
      status: HttpStatus.CONFLICT,
      message: 'Email vion@gmail.com is already registered',
    });

    expect(err).toEqual({
      status: HttpStatus.CONFLICT,
      message: 'Email vion@gmail.com is already registered',
    });
  });

  it('falls back to a generic 500 payload for unrecognized errors', async () => {
    const err = await catchAndReject(new Error('boom'));

    expect(err).toEqual({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  });
});
