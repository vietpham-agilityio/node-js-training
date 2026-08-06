// Default to localhost for local multi-process dev (and CI, where there's no
// `.env`); Docker Compose overrides these with each service's Compose name.
export const ORDER_BASE_URL =
  process.env.ORDER_SERVICE_BASE_URL ?? 'http://localhost:3001';
export const USER_BASE_URL =
  process.env.USER_SERVICE_BASE_URL ?? 'http://localhost:3003';
export const PRODUCT_BASE_URL =
  process.env.PRODUCT_SERVICE_BASE_URL ?? 'http://localhost:3004';

export const API_ENDPOINT = {
  ORDER: '/orders',
  USER: '/users',
  PRODUCT: '/products',
};
