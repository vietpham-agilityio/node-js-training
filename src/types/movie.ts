export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  trailerUrl: string;
  durationMinutes: number;
  releaseDate: string;
  rating: number;
  genre: string[];
  castCrew?: any;
  language?: string;
  status: 'now_playing' | 'coming_soon' | 'ended';
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

