import { HallType } from '../../../modules/showtimes/enums/hall-type.enum';

export interface HallFixture {
  name: string;
  hallType: HallType;
  rows: string[];
  seatsPerRow: number;
  basePrice: number;
}

// Two halls with generated seat grids, per DDR-009's demo catalogue.
export const HALL_FIXTURES: HallFixture[] = [
  {
    name: 'Hall 1',
    hallType: HallType.TWO_D,
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    seatsPerRow: 8,
    basePrice: 8.5,
  },
  {
    name: 'Hall 2',
    hallType: HallType.IMAX,
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    seatsPerRow: 8,
    basePrice: 14,
  },
];
