import type { Request } from 'express';
import type { AuthTokenPayload } from '@app/constants';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}
