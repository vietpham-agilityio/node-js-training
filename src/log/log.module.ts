import { Module } from '@nestjs/common';
import { LogController } from './log.controller';
import { LoggingService } from './log.service';

@Module({
  controllers: [LogController],
  providers: [LoggingService]
})
export class LogModule {}
