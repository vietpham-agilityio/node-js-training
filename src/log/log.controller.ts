import { Controller, Get, Req } from '@nestjs/common';
import { LoggingService } from './log.service';
import { type Request } from 'express';

@Controller('log')
export class LogController {
    constructor(
        private readonly loggingService: LoggingService
    ) { }

    @Get('annotate')
    annotateRequest(@Req() request: Request) {
        request['customMetadata'] = {
            timestamp: new Date(),
            userAgent: request.headers['user-agent'],
            route: request.url,
            
        };

        this.loggingService.logActivity(request);
    }
}
