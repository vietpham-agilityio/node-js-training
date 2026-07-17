import { Injectable } from '@nestjs/common';
import { Request } from 'express'

@Injectable()
export class LoggingService {
    logActivity(request: Request) {
        const metadata = request['customMetadata'];
        console.log(
            `Accessed route: ${metadata.route} at
            ${metadata.timestamp} via ${metadata.userAgent}, ip: ${request.ip}`);
    }
}
