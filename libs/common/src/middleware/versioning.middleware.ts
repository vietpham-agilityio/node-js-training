import { Injectable, NestMiddleware } from '@nestjs/common';

// Extensions
import { NextFunction, Request, Response } from 'express';

const SUPPORTED_VERSIONS = ['v1', 'v2'];

@Injectable()
export class VersionManagementMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const [path, query] = req.originalUrl.split('?');
    const segments = path.split('/').filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();

    if (!firstSegment || !firstSegment.startsWith('v')) {
      segments.unshift('v1');
    } else if (!SUPPORTED_VERSIONS.includes(firstSegment)) {
      segments[0] = 'v2';
    }

    req.url = '/' + segments.join('/') + (query ? `?${query}` : '');

    next();
  }
}
