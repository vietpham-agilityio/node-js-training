import { API_VERSION, CLIENT_URL } from "./environments.ts"

export const ROUTES = {
  USERS: `/api/${API_VERSION}/users`,
  AUTH: `/api/${API_VERSION}/auth`,
  COURSES: `/api/${API_VERSION}/courses`,
  STRIPE_WEBHOOK: `/api/${API_VERSION}/webhooks/stripe`,
}

export const CHECKOUT_FALLBACK = {
  SUCCESS_URL: `${CLIENT_URL}/courses/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  CANCEL_URL: `${CLIENT_URL}/courses/checkout/cancel`,
}
