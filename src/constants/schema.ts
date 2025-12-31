import * as v from 'valibot';

// Constans
import { ERROR_MESSAGES } from './messages';
import { LOWERCASE_REGEX, SPECIAL_CHAR_REGEX, UPPERCASE_REGEX } from './regex';

// Custom password validations
const hasUppercase = (input: string) => UPPERCASE_REGEX.test(input);
const hasLowercase = (input: string) => LOWERCASE_REGEX.test(input);
const hasSpecialChar = (input: string) => SPECIAL_CHAR_REGEX.test(input);

export const signInSchema = v.object({
  email: v.pipe(
    v.string(ERROR_MESSAGES.EMAIL_REQUIRED),
    v.nonEmpty(ERROR_MESSAGES.EMAIL_REQUIRED),
    v.email(ERROR_MESSAGES.EMAIL_INVALID),
  ),
  password: v.pipe(
    v.string(ERROR_MESSAGES.PASSWORD_REQUIRED),
    v.nonEmpty(ERROR_MESSAGES.PASSWORD_REQUIRED),
    v.minLength(8, ERROR_MESSAGES.PASSWORD_MIN_LENGTH(8)),
    v.check(hasUppercase, ERROR_MESSAGES.PASSWORD_UPPERCASE),
    v.check(hasLowercase, ERROR_MESSAGES.PASSWORD_LOWERCASE),
    v.check(hasSpecialChar, ERROR_MESSAGES.PASSWORD_SPECIAL_CHAR),
  ),
});

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatarUrl?: string;
}

export const signUpSchema = v.pipe(
  v.object({
    fullName: v.pipe(
      v.string(),
      v.minLength(1, ERROR_MESSAGES.FULL_NAME_REQUIRED),
      v.minLength(2, ERROR_MESSAGES.FULL_NAME_MIN_LENGTH(2)),
      v.maxLength(50, ERROR_MESSAGES.FULL_NAME_MAX_LENGTH(50)),
    ),
    email: v.pipe(
      v.string(),
      v.minLength(1, ERROR_MESSAGES.EMAIL_REQUIRED),
      v.email(ERROR_MESSAGES.EMAIL_INVALID),
    ),
    password: v.pipe(
      v.string(ERROR_MESSAGES.PASSWORD_REQUIRED),
      v.nonEmpty(ERROR_MESSAGES.PASSWORD_REQUIRED),
      v.minLength(8, ERROR_MESSAGES.PASSWORD_MIN_LENGTH(8)),
      v.check(hasUppercase, ERROR_MESSAGES.PASSWORD_UPPERCASE),
      v.check(hasLowercase, ERROR_MESSAGES.PASSWORD_LOWERCASE),
      v.check(hasSpecialChar, ERROR_MESSAGES.PASSWORD_SPECIAL_CHAR),
    ),
    confirmPassword: v.pipe(
      v.string(ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
      v.nonEmpty(ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
    ),
    avatarUrl: v.optional(v.string()),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      input => input.password === input.confirmPassword,
      ERROR_MESSAGES.PASSWORD_NOT_MATCH,
    ),
    ['confirmPassword'],
  ),
);

export const editProfileSchema = v.pipe(
  v.object({
    fullName: v.pipe(
      v.string(),
      v.minLength(1, ERROR_MESSAGES.FULL_NAME_REQUIRED),
      v.minLength(2, ERROR_MESSAGES.FULL_NAME_MIN_LENGTH(2)),
      v.maxLength(50, ERROR_MESSAGES.FULL_NAME_MAX_LENGTH(50)),
    ),

    email: v.pipe(
      v.string(),
      v.minLength(1, ERROR_MESSAGES.EMAIL_REQUIRED),
      v.email(ERROR_MESSAGES.EMAIL_INVALID),
    ),

    address: v.pipe(
      v.union([v.string(), v.null()]),
      v.transform(val => (val ?? '').trim()),
    ),

    phoneNumber: v.pipe(
      v.union([v.string(), v.null()]),
      v.transform(val => val ?? ''),
      v.check(
        val =>
          val.length === 0 ||
          (/^\+?[1-9]\d{1,14}$/.test(val) &&
            val.replace(/\D/g, '').length >= 9),
        ERROR_MESSAGES.INVALID_PHONE_NUMBER,
      ),
    ),

    avatarUrl: v.pipe(v.union([v.string(), v.null()])),
  }),
);

export const changePasswordSchema = v.pipe(
  v.object({
    currentPassword: v.pipe(
      v.string(ERROR_MESSAGES.PASSWORD_REQUIRED),
      v.nonEmpty(ERROR_MESSAGES.PASSWORD_REQUIRED),
    ),
    newPassword: v.pipe(
      v.string(ERROR_MESSAGES.PASSWORD_REQUIRED),
      v.nonEmpty(ERROR_MESSAGES.PASSWORD_REQUIRED),
      v.minLength(8, ERROR_MESSAGES.PASSWORD_MIN_LENGTH(8)),
      v.check(hasUppercase, ERROR_MESSAGES.PASSWORD_UPPERCASE),
      v.check(hasLowercase, ERROR_MESSAGES.PASSWORD_LOWERCASE),
      v.check(hasSpecialChar, ERROR_MESSAGES.PASSWORD_SPECIAL_CHAR),
    ),
    confirmPassword: v.pipe(
      v.string(ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
      v.nonEmpty(ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
    ),
  }),
  v.forward(
    v.partialCheck(
      [['newPassword'], ['confirmPassword']],
      input => input.newPassword === input.confirmPassword,
      ERROR_MESSAGES.PASSWORD_NOT_MATCH,
    ),
    ['confirmPassword'],
  ),
);

// Validation schema
export const resetPasswordSchema = v.pipe(
  v.object({
    newPassword: v.pipe(
      v.string(ERROR_MESSAGES.PASSWORD_REQUIRED),
      v.nonEmpty(ERROR_MESSAGES.PASSWORD_REQUIRED),
      v.minLength(8, ERROR_MESSAGES.PASSWORD_MIN_LENGTH(8)),
      v.check(hasUppercase, ERROR_MESSAGES.PASSWORD_UPPERCASE),
      v.check(hasLowercase, ERROR_MESSAGES.PASSWORD_LOWERCASE),
      v.check(hasSpecialChar, ERROR_MESSAGES.PASSWORD_SPECIAL_CHAR),
    ),
    confirmPassword: v.pipe(
      v.string(ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
      v.nonEmpty(ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
    ),
  }),
  v.forward(
    v.partialCheck(
      [['newPassword'], ['confirmPassword']],
      input => input.newPassword === input.confirmPassword,
      ERROR_MESSAGES.PASSWORD_NOT_MATCH,
    ),
    ['confirmPassword'],
  ),
);

export type ResetPasswordFormData = v.InferOutput<typeof resetPasswordSchema>;

export type ChangePasswordFormData = v.InferOutput<typeof changePasswordSchema>;

export type SignUpFormData = v.InferOutput<typeof signUpSchema>;

export type SignInFormData = v.InferInput<typeof signInSchema>;

export type EditProfileFormData = v.InferInput<typeof editProfileSchema>;
