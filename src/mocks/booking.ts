import { PROMO_CODE_STATUS } from '@/constants/status';
import { PromoCode, PromoCodeStatus } from '@/features/booking/schemas/movie';

export const MOCK_PROMOTIONS: PromoCode[] = [
  {
    id: '1',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PROMO_CODE_STATUS.PERCENTAGE as PromoCodeStatus,
    discountValue: 50,
  },
  {
    id: '2',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PROMO_CODE_STATUS.PERCENTAGE as PromoCodeStatus,
    discountValue: 50,
  },
  {
    id: '3',
    code: 'Student Holiday',
    description: 'Maximal only for two people',
    discountType: PROMO_CODE_STATUS.PERCENTAGE as PromoCodeStatus,
    discountValue: 50,
  },
];

export const MOCK_ORDER_DETAIL = {
  idOrder: '22081996',
  cinema: 'FX Sudirman XXI',
  dateTime: 'Sun May 22, 16:40',
  seatNumber: 'D7,D8,D9',
  pricePerTicket: 50000,
  quantity: 3,
};

export const MOCK_WALLET_BALANCE = 200000;
