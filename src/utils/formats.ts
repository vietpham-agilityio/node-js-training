import { PromoCodeStatus } from '@/types';

export const formatCurrency = (amount: number, currency = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number to IDR currency format with dot separator
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "IDR 200.000")
 */
export function formatIDR(
  amount: number,
  options?: {
    showCurrency?: boolean;
    decimals?: number;
  },
): string {
  const { showCurrency = true, decimals = 0 } = options || {};

  // Format number with dot as thousand separator
  const formattedNumber = amount.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showCurrency ? `IDR ${formattedNumber}` : formattedNumber;
}

export const formatDate = (date: string | Date, format = 'long'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

export const generateBookingNumber = (): string => {
  return Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
};

export const generateTicketNumber = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `TKT-${date}-${random}`;
};

export const isExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date();
};

export const getTimeRemaining = (expiresAt: string): string => {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
};

export const calculateDiscount = (
  amount: number,
  discountType: PromoCodeStatus,
  discountValue: number,
  maxDiscount?: number,
): number => {
  let discount = 0;

  if (discountType === PromoCodeStatus.PERCENTAGE) {
    discount = (amount * discountValue) / 100;
    if (maxDiscount && discount > maxDiscount) {
      discount = maxDiscount;
    }
  } else {
    discount = discountValue;
  }

  return Math.min(discount, amount);
};

export const formatMovieDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}min`;
};

export const formatShowtimeDate = (
  showtime?: string,
  showDate?: string,
): string => {
  if (showtime && showDate) {
    return `${showtime}, ${showDate}`;
  }
  if (showtime) {
    return showtime;
  }
  if (showDate) {
    return showDate;
  }
  return '';
};
