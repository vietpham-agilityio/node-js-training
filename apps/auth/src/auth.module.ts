import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { decodeBase64Key, AppLoggerModule } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    AppLoggerModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        privateKey: decodeBase64Key(process.env.JWT_PRIVATE_KEY_BASE64),
        publicKey: decodeBase64Key(process.env.JWT_PUBLIC_KEY_BASE64),
        signOptions: { algorithm: 'RS256', expiresIn: '1h' },
      }),
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST,
          port: 8004,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
