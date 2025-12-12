export enum MovieStatus {
  NOW_PLAYING = 'now_playing',
  COMING_SOON = 'coming_soon',
  ENDED = 'ended',
}

export enum PromoCodeStatus {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export interface CastMember {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  trailerUrl: string[];
  durationMinutes: number;
  releaseDate: string;
  rating: number;
  genre: string[];
  castCrew?: CastMember;
  language?: string;
  status: MovieStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discountType: PromoCodeStatus;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
