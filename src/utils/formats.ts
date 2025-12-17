import { PromoCodeStatus, Seat } from '@/types';

export const formatCardNumber = (number?: string) => {
  if (!number) return '•••• •••• •••• ••••';

  // Remove all non-digits
  const cleaned = number.replace(/\D/g, '');

  // Format as groups of 4
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ') : number;
};

export const formatCurrency = (amount: number, currency = 'IDR'): string => {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // Add space between currency symbol and amount (e.g., "Rp 150.000" instead of "Rp150.000")
  return formatted.replace(/([A-Za-z]+)(\d)/, '$1 $2');
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

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const weekday = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
  });

  const month = dateObj.toLocaleDateString('en-US', {
    month: 'short',
  });

  const day = dateObj.toLocaleDateString('en-US', {
    day: '2-digit',
  });

  return `${weekday} ${month} ${day}`;
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

export const calculateTotalPrice = (price: number, seats: number): number => {
  return price * seats;
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
  showDate?: Date | string,
): string => {
  if (showtime && showDate) {
    return `${formatTime(showtime)}, ${formatDate(showDate)}`;
  }
  if (showtime) {
    return formatTime(showtime);
  }
  if (showDate) {
    return formatDate(showDate);
  }
  return '';
};

// Clamp rating between 0 and 5
// Each star represents 1 point (0-5 scale)
export const clampedRatingToStars = (rating: number) => {
  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));

  // Calculate filled percentage for each star (each star represents 1 point)
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    if (clampedRating >= starValue) {
      return 1; // Fully filled
    } else if (clampedRating > index) {
      return clampedRating - index; // Partially filled
    }
    return 0; // Empty
  });

  return stars;
};

export const groupSeatsByRow = (seats: Seat[]): Record<string, Seat[]> => {
  const grouped: Record<string, Seat[]> = {};
  seats.forEach(seat => {
    if (!grouped[seat.row]) {
      grouped[seat.row] = [];
    }
    grouped[seat.row].push(seat);
  });
  return grouped;
};
