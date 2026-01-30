import { Schema } from 'effect';

// Constants
import { ERROR_MESSAGES } from './messages';
import {
  LOWERCASE_REGEX,
  SPECIAL_CHAR_REGEX,
  UPPERCASE_REGEX,
  EMAIL_REGEX,
} from './regex';

// Email Brand
export const EmailBrand = Schema.String.pipe(
  Schema.minLength(1, { message: () => ERROR_MESSAGES.EMAIL_REQUIRED }),
  Schema.filter(s => EMAIL_REGEX.test(s), {
    message: () => ERROR_MESSAGES.EMAIL_INVALID,
  }),
  Schema.brand('Email'),
);
export type EmailType = Schema.Schema.Type<typeof EmailBrand>;

// Password Brand
export const PasswordBrand = Schema.String.pipe(
  Schema.minLength(1, { message: () => ERROR_MESSAGES.PASSWORD_REQUIRED }),
  Schema.minLength(8, {
    message: () => ERROR_MESSAGES.PASSWORD_MIN_LENGTH(8),
  }),
  Schema.filter(s => UPPERCASE_REGEX.test(s), {
    message: () => ERROR_MESSAGES.PASSWORD_UPPERCASE,
  }),
  Schema.filter(s => LOWERCASE_REGEX.test(s), {
    message: () => ERROR_MESSAGES.PASSWORD_LOWERCASE,
  }),
  Schema.filter(s => SPECIAL_CHAR_REGEX.test(s), {
    message: () => ERROR_MESSAGES.PASSWORD_SPECIAL_CHAR,
  }),
  Schema.brand('Password'),
);
export type PasswordType = Schema.Schema.Type<typeof PasswordBrand>;

// Full Name Brand
export const FullNameBrand = Schema.String.pipe(
  Schema.minLength(1, { message: () => ERROR_MESSAGES.FULL_NAME_REQUIRED }),
  Schema.minLength(2, {
    message: () => ERROR_MESSAGES.FULL_NAME_MIN_LENGTH(2),
  }),
  Schema.maxLength(50, {
    message: () => ERROR_MESSAGES.FULL_NAME_MAX_LENGTH(50),
  }),
  Schema.brand('FullName'),
);
export type FullNameType = Schema.Schema.Type<typeof FullNameBrand>;

// Phone Number Brand
export const PhoneNumberBrand = Schema.NullOr(Schema.String).pipe(
  Schema.transform(Schema.String, {
    decode: val => val ?? '',
    encode: val => val,
  }),
  Schema.filter(
    val =>
      val.length === 0 ||
      (/^\+?[1-9]\d{1,14}$/.test(val) && val.replace(/\D/g, '').length >= 9),
    {
      message: () => ERROR_MESSAGES.INVALID_PHONE_NUMBER,
    },
  ),
  Schema.brand('PhoneNumber'),
);
export type PhoneNumberType = Schema.Schema.Type<typeof PhoneNumberBrand>;

// Address Brand
export const AddressBrand = Schema.NullOr(Schema.String).pipe(
  Schema.transform(Schema.String, {
    decode: val => (val ?? '').trim(),
    encode: val => val,
  }),
  Schema.brand('Address'),
);
export type AddressType = Schema.Schema.Type<typeof AddressBrand>;

// Sign In Schema
export const signInSchema = Schema.Struct({
  email: EmailBrand,
  password: PasswordBrand,
});
export type SignInFormData = Schema.Schema.Type<typeof signInSchema>;

// Sign Up Schema with password confirmation
export const signUpSchema = Schema.Struct({
  fullName: FullNameBrand,
  email: EmailBrand,
  password: PasswordBrand,
  confirmPassword: Schema.String.pipe(
    Schema.minLength(1, {
      message: () => ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
    }),
  ),
  avatarUrl: Schema.optional(Schema.String),
}).pipe(
  Schema.filter(data => data.password === data.confirmPassword, {
    message: () => ERROR_MESSAGES.PASSWORD_NOT_MATCH,
  }),
);
export type SignUpFormData = Schema.Schema.Type<typeof signUpSchema>;

// Edit Profile Schema
export const editProfileSchema = Schema.Struct({
  fullName: FullNameBrand,
  email: EmailBrand,
  address: AddressBrand,
  phoneNumber: PhoneNumberBrand,
  avatarUrl: Schema.NullOr(Schema.String),
});
export type EditProfileFormData = Schema.Schema.Type<typeof editProfileSchema>;

// Change Password Schema
export const changePasswordSchema = Schema.Struct({
  currentPassword: PasswordBrand,
  newPassword: PasswordBrand,
  confirmPassword: PasswordBrand,
}).pipe(
  Schema.filter(data => data.newPassword === data.confirmPassword, {
    message: () => ERROR_MESSAGES.PASSWORD_NOT_MATCH,
  }),
);
export type ChangePasswordFormData = Schema.Schema.Type<
  typeof changePasswordSchema
>;

// Reset Password Schema
export const resetPasswordSchema = Schema.Struct({
  newPassword: PasswordBrand,
  confirmPassword: PasswordBrand,
}).pipe(
  Schema.filter(data => data.newPassword === data.confirmPassword, {
    message: () => ERROR_MESSAGES.PASSWORD_NOT_MATCH,
  }),
);
export type ResetPasswordFormData = Schema.Schema.Type<
  typeof resetPasswordSchema
>;

// Forgot Password Schema
export const forgotPasswordSchema = Schema.Struct({
  email: EmailBrand,
});
export type ForgotPasswordFormData = Schema.Schema.Type<
  typeof forgotPasswordSchema
>;
