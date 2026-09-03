import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SeatHold } from './entities/seat-hold.entity';
import { SeatHoldStatus } from './enums/seat-hold-status.enum';
import { SeatHoldSweepService } from './seat-hold-sweep.service';

describe('SeatHoldSweepService', () => {
  let service: SeatHoldSweepService;
  let repo: { update: jest.Mock };

  beforeEach(async () => {
    repo = { update: jest.fn().mockResolvedValue({ affected: 0 }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatHoldSweepService,
        { provide: getRepositoryToken(SeatHold), useValue: repo },
      ],
    }).compile();

    service = module.get(SeatHoldSweepService);
  });

  it('flips held rows past their held_until to expired', async () => {
    await service.releaseExpiredHolds();

    expect(repo.update).toHaveBeenCalledTimes(1);
    const [criteria, changes] = repo.update.mock.calls[0] as [
      { status: SeatHoldStatus; heldUntil: { type: string; value: Date } },
      { status: SeatHoldStatus },
    ];

    expect(criteria.status).toBe(SeatHoldStatus.HELD);
    expect(criteria.heldUntil.type).toBe('lessThan');
    expect(criteria.heldUntil.value).toBeInstanceOf(Date);
    expect(changes).toEqual({ status: SeatHoldStatus.EXPIRED });
  });
});
