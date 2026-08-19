import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let health: { check: jest.Mock };
  let database: { pingCheck: jest.Mock };

  const result = {
    status: 'ok',
    info: { database: { status: 'up' } },
    error: {},
    details: { database: { status: 'up' } },
  } as HealthCheckResult;

  beforeEach(async () => {
    health = { check: jest.fn().mockResolvedValue(result) };
    database = { pingCheck: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: health },
        { provide: TypeOrmHealthIndicator, useValue: database },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('reports the aggregated health check result', async () => {
    await expect(controller.check()).resolves.toBe(result);
    expect(health.check).toHaveBeenCalledTimes(1);
  });

  it('includes a database ping in the checks it runs', async () => {
    await controller.check();

    const [indicators] = health.check.mock.calls[0] as [Array<() => unknown>];
    indicators.forEach((indicator) => indicator());

    expect(database.pingCheck).toHaveBeenCalledWith('database');
  });
});
