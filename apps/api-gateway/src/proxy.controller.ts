import { Controller, Post, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request, Response } from 'express';

@Controller('orders')
export class ProxyController {
  constructor(private httpService: HttpService) {}
  @Post('/create')
  async forwardToOrderService(@Req() req: Request, @Res() res: Response) {
    const { data } = await firstValueFrom(
      this.httpService.post<unknown>(
        'http://localhost:3001/orders-create',
        req.body,
      ),
    );

    res.json(data);
  }
}
