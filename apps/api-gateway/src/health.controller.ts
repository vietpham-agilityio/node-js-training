import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @ApiOperation({ summary: 'Check api-gateway liveness' })
  @ApiOkResponse({ description: 'api-gateway is up' })
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        Promise.resolve({ 'api-gateway': { status: 'up' } }),
    ]);
  }
}
