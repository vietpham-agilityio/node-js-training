export enum USER_ROLE {
  ADMIN = 'admin',
  USER = 'user',
  MERCHANT = 'merchant',
}

export interface UserCredentialsShape {
  id: number;
  email: string;
  role: USER_ROLE;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: USER_ROLE;
  address?: string;
}
