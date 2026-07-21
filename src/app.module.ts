import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { LogModule } from './log/log.module';
import { AppGateway } from './socket';

@Module({
  imports: [UserModule, AuthModule, LogModule, AppGateway],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
