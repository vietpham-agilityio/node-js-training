import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { LogModule } from './log/log.module';

@Module({
  imports: [UserModule, AuthModule, LogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
