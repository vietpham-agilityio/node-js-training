export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  avatarUrl?: string;
}
