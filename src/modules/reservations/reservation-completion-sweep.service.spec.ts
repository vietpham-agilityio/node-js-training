import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Reservation } from './entities/reservation.entity';
import { ReservationStatus } from './enums/reservation-status.enum';
import { ReservationCompletionSweepService } from './reservation-completion-sweep.service';

function mockQueryBuilder() {
  const qb: Record<string, jest.Mock> = {};
  for (const method of ['innerJoinAndSelect', 'where', 'andWhere']) {
    qb[method] = jest.fn().mockReturnValue(qb);
  }
  qb.getMany = jest.fn().mockResolvedValue([]);
  return qb;
}

describe('ReservationCompletionSweepService', () => {
  let service: ReservationCompletionSweepService;
  let repo: { createQueryBuilder: jest.Mock; update: jest.Mock };
  let qb: ReturnType<typeof mockQueryBuilder>;

  beforeEach(async () => {
    qb = mockQueryBuilder();
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      update: jest.fn().mockResolvedValue({ affected: 0 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationCompletionSweepService,
        { provide: getRepositoryToken(Reservation), useValue: repo },
      ],
    }).compile();

    service = module.get(ReservationCompletionSweepService);
  });

  it('completes confirmed reservations whose showtime has already ended', async () => {
    qb.getMany.mockResolvedValue([
      {
        id: 'r1',
        showtime: {
          showDate: '2000-01-01',
          showTime: '19:00:00',
          endTime: '21:00:00',
        },
      },
    ]);

    await service.completeFinishedReservations();

    expect(qb.where).toHaveBeenCalledWith('reservation.status = :confirmed', {
      confirmed: ReservationStatus.CONFIRMED,
    });
    expect(repo.update).toHaveBeenCalledWith(
      { id: expect.anything() },
      { status: ReservationStatus.COMPLETED },
    );
  });

  it('leaves a reservation alone while its showtime is still in the future', async () => {
    qb.getMany.mockResolvedValue([
      {
        id: 'r1',
        showtime: {
          showDate: '2099-01-01',
          showTime: '19:00:00',
          endTime: '21:00:00',
        },
      },
    ]);

    await service.completeFinishedReservations();

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('does nothing when there are no confirmed reservations to consider', async () => {
    qb.getMany.mockResolvedValue([]);

    await service.completeFinishedReservations();

    expect(repo.update).not.toHaveBeenCalled();
  });
});
