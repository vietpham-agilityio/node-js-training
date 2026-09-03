import type { TokenPair } from '@movea/api-contract';

import { STORAGE_KEYS } from '@/constants';
import { secureStorage } from '@/services/storage/secure';

/**
 * The `@movea/api` token pair, persisted in `secureStorage` (both keys resolve
 * to SecureStore). The access token rides on every authenticated request; the
 * refresh token is spent on `/auth/refresh` and `/auth/logout`.
 */
export const saveTokens = async ({
  accessToken,
  refreshToken,
}: TokenPair): Promise<void> => {
  await Promise.all([
    secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
};

export const getAccessToken = (): Promise<string | null> =>
  secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

export const getRefreshToken = (): Promise<string | null> =>
  secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

export const clearTokens = async (): Promise<void> => {
  await Promise.all([
    secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
    secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
};
