import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

export const DEFAULT_CACHE_TTL_MS = 600;

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        ttl: DEFAULT_CACHE_TTL_MS,
        stores:
          process.env.REDIS_URL && process.env.NODE_ENV !== 'test'
            ? [createKeyv(process.env.REDIS_URL)]
            : undefined,
      }),
    }),
  ],
  exports: [CacheModule],
})

export class AppCacheModule {}
