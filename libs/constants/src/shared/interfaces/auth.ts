import { USER_ROLE } from './user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address?: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface AuthTokenPayload {
  sub: number;
  email: string;
  role: USER_ROLE;
}
