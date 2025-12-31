export enum MovieStatus {
  NOW_PLAYING = 'now_playing',
  COMING_SOON = 'coming_soon',
  ENDED = 'ended',
}

export enum PromoCodeStatus {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum GenreMovie {
  ALL = 'all',
  ACTION = 'action',
  ADVENTURE = 'adventure',
  ANIMATION = 'animation',
  COMEDY = 'comedy',
  CRIME = 'crime',
  DOCUMENTARY = 'documentary',
  DRAMA = 'drama',
  FAMILY = 'family',
  FANTASY = 'fantasy',
  HISTORY = 'history',
  HORROR = 'horror',
  MUSIC = 'music',
  MYSTERY = 'mystery',
  ROMANCE = 'romance',
  SCI_FI = 'science_fiction',
  TV_MOVIE = 'tv_movie',
  THRILLER = 'thriller',
  WAR = 'war',
  WESTERN = 'western',
}

export interface CastMember {
  character?: string;
  name: string;
  imageUrl: string | null;
}

export interface CrewMember {
  name: string;
}

export interface CastCrew {
  actors: CastMember[];
  directors: CrewMember[];
  producers: CrewMember[];
  writers: CrewMember[];
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
  genre: GenreMovie[];
  castCrew: CastCrew;
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
