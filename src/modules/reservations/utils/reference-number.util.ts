// DDR-004/BR-21/BR-22: RSV-{YYYYMMDD}-{6 base-36 chars}, TKT-{reservation
// suffix}-{seat sequence}. The date is the confirmation moment, not the
// showtime's date — this is a booking record, not a showtime label.
const BASE36_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SUFFIX_LENGTH = 6;

const randomBase36 = (length: number): string =>
  Array.from(
    { length },
    () => BASE36_ALPHABET[Math.floor(Math.random() * BASE36_ALPHABET.length)],
  ).join('');

export const generateReservationNumber = (now: Date = new Date()): string => {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `RSV-${year}${month}${day}-${randomBase36(SUFFIX_LENGTH)}`;
};

export const reservationSuffix = (reservationNumber: string): string =>
  reservationNumber.split('-')[2];

export const generateTicketNumber = (
  reservationNumberSuffix: string,
  seatSequence: number,
): string =>
  `TKT-${reservationNumberSuffix}-${String(seatSequence).padStart(2, '0')}`;
