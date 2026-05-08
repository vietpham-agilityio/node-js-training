// Errors
import { AppError } from '@/types/error.ts';

// Constants
import { STATUS_CODE } from '@/constants/status-code.ts';
import { COURSE_ERROR, PAYMENT_ERROR } from '@/constants/error-messages.ts';
import { DEFAULT_CURRENCY, DEFAULT_PRICE_CENTS } from '@/constants/currency.ts';

export const parseCourseId = (raw: string): string => {
  const idParsed = raw.trim();

  if (
    !idParsed ||
    !Number.isInteger(Number(idParsed)) ||
    Number(idParsed) <= 0
  ) {
    throw new AppError(STATUS_CODE.BAD_REQUEST, COURSE_ERROR.COURSE_INVALID_ID);
  }

  return idParsed;
};

export const resolveAmountAndCurrency = ({
  priceCents,
  currency = DEFAULT_CURRENCY,
}: {
  priceCents: number;
  currency?: string;
}): { unitAmount: number; currency: string } => {
  const unitAmount = priceCents >= 0 ? priceCents : DEFAULT_PRICE_CENTS;

  if (currency === 'usd' && unitAmount < 50) {
    throw new AppError(
      STATUS_CODE.BAD_REQUEST,
      PAYMENT_ERROR.CHECKOUT_AMOUNT_TOO_LOW,
    );
  }

  return { unitAmount, currency };
};
