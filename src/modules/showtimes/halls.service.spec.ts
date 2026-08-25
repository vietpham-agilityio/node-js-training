import { MethodNotAllowedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Hall } from './entities/hall.entity';
import { HallType } from './enums/hall-type.enum';
import { HallsService } from './halls.service';

function mockQueryBuilder() {
  const qb: Record<string, jest.Mock> = {};
  for (const method of [
    'leftJoin',
    'select',
    'addSelect',
    'where',
    'groupBy',
    'orderBy',
  ]) {
    qb[method] = jest.fn().mockReturnValue(qb);
  }
  qb.getRawMany = jest.fn();
  return qb;
}

describe('HallsService', () => {
  let service: HallsService;
  let repo: { createQueryBuilder: jest.Mock };
  let qb: ReturnType<typeof mockQueryBuilder>;

  beforeEach(async () => {
    qb = mockQueryBuilder();
    repo = { createQueryBuilder: jest.fn().mockReturnValue(qb) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HallsService,
        { provide: getRepositoryToken(Hall), useValue: repo },
      ],
    }).compile();

    service = module.get(HallsService);
  });

  describe('findAllHalls', () => {
    it('returns a plain array with no pagination envelope', async () => {
      qb.getRawMany.mockResolvedValue([
        {
          id: 'h1',
          name: 'Hall 1',
          hallType: HallType.TWO_D,
          totalSeats: '48',
        },
      ]);

      const halls = await service.findAllHalls();

      expect(halls).toEqual([
        { id: 'h1', name: 'Hall 1', hallType: HallType.TWO_D, totalSeats: 48 },
      ]);
    });

    it('coerces the COUNT pg returns as a string into a number', async () => {
      qb.getRawMany.mockResolvedValue([
        { id: 'h1', name: 'Hall 1', hallType: HallType.IMAX, totalSeats: '48' },
      ]);

      const [hall] = await service.findAllHalls();

      expect(hall.totalSeats).toBe(48);
      expect(typeof hall.totalSeats).toBe('number');
    });

    it('hides retired halls and counts only active seats', async () => {
      qb.getRawMany.mockResolvedValue([]);

      await service.findAllHalls();

      expect(qb.where).toHaveBeenCalledWith('hall.isActive = true');
      expect(qb.leftJoin).toHaveBeenCalledWith(
        'hall.seats',
        'seat',
        'seat.isActive = true',
      );
    });
  });

  describe('remove', () => {
    // DDR-015: halls expose no mutation route, so this is unreachable through
    // the API — it must fail loudly rather than silently retire a hall.
    it('refuses, because halls are read-only', () => {
      expect(() => service.remove()).toThrow(MethodNotAllowedException);
    });
  });
});
