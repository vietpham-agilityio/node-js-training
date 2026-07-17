import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction) {
        console.log(
            `[${new Date().toISOString()}]
            Request made to: ${req.path}`);
        next();
    }
}