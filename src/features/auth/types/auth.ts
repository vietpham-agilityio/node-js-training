/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Schema } from 'effect';

export const SignUpDataSchema = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
  fullName: Schema.optional(Schema.String),
  avatarUrl: Schema.optional(Schema.String),
});

export const SignInDataSchema = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
});

export const UserProfileSchema = Schema.Struct({
  id: Schema.String,
  fullName: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  phoneNumber: Schema.optional(Schema.String),
  address: Schema.optional(Schema.String),
  avatarUrl: Schema.optional(Schema.String),
  createdAt: Schema.optional(Schema.String),
  updatedAt: Schema.optional(Schema.String),
});

export const UpdateProfileDataSchema = Schema.Struct({
  fullName: Schema.optional(Schema.String),
  phoneNumber: Schema.optional(Schema.String),
  address: Schema.optional(Schema.String),
  email: Schema.optional(Schema.String),
  avatarUrl: Schema.optional(Schema.String),
});

export const ChangePasswordDataSchema = Schema.Struct({
  currentPassword: Schema.String,
  newPassword: Schema.String,
});

export interface SignUpData extends Schema.Schema.Type<
  typeof SignUpDataSchema
> {}
export interface SignInData extends Schema.Schema.Type<
  typeof SignInDataSchema
> {}
export interface UserProfile extends Schema.Schema.Type<
  typeof UserProfileSchema
> {}
export interface UpdateProfileData extends Schema.Schema.Type<
  typeof UpdateProfileDataSchema
> {}
export interface ChangePasswordData extends Schema.Schema.Type<
  typeof ChangePasswordDataSchema
> {}
