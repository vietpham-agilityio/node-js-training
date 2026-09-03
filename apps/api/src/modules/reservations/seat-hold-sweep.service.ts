import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { SeatHold } from './entities/seat-hold.entity';
import { SeatHoldStatus } from './enums/seat-hold-status.enum';

// ADR-009/DDR-001/BR-27: releases abandoned holds every 60 seconds. Never a
// correctness requirement by itself — uq_seat_hold_active only excludes
// held/confirmed rows, so a hold that outlives its held_until without ever
// being swept would otherwise block that seat forever.
@Injectable()
export class SeatHoldSweepService {
  private readonly logger = new Logger(SeatHoldSweepService.name);

  constructor(
    @InjectRepository(SeatHold)
    private readonly seatHolds: Repository<SeatHold>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredHolds(): Promise<void> {
    const { affected } = await this.seatHolds.update(
      { status: SeatHoldStatus.HELD, heldUntil: LessThan(new Date()) },
      { status: SeatHoldStatus.EXPIRED },
    );

    if (affected) {
      this.logger.log(`Released ${affected} expired seat hold(s)`);
    }
  }
}
