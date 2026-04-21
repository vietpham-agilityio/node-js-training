import pino from 'pino';

// Constant
import { NODE_ENV } from '@/constants/environments.ts';


export const createLogger = (): pino.Logger => {
  if (NODE_ENV === 'test') pino({ level: 'silent' })

  return pino({
    level: "info", transport: {
      target: 'pino-pretty', options: {
        colorize: true,
      }
    }
  })
}
