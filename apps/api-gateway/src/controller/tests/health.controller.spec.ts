import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import { HealthController } from '..';

describe('HealthController', () => {
  let controller: HealthController;
  let health: jest.Mocked<Pick<HealthCheckService, 'check'>>;

  beforeEach(async () => {
    const mockHealthCheckService = {
      check: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    health = module.get(HealthCheckService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('invokes HealthCheckService.check with a self-liveness indicator and returns its result', async () => {
    const expected = { status: 'ok', info: {}, error: {}, details: {} };
    health.check.mockResolvedValue(expected as never);

    const result = await controller.check();

    expect(result).toEqual(expected);
    expect(health.check).toHaveBeenCalledTimes(1);
    const indicators = health.check.mock.calls[0][0];
    expect(indicators).toHaveLength(1);
    await expect(indicators[0]()).resolves.toEqual({
      'api-gateway': { status: 'up' },
    });
  });
});
