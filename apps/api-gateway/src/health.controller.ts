import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        Promise.resolve({ 'api-gateway': { status: 'up' } }),
    ]);
  }
}
