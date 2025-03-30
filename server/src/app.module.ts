import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { EmailModule } from './modules/email/email.module';
import config from './config';
import { DB_CONFIG, JWT_CONFIG } from './common/constant/register-name.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: config,
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<MongooseModuleOptions>(DB_CONFIG);
        if (!config) {
          throw new Error('Cannot connect to Database');
        }
        return config;
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<JwtModuleOptions>(JWT_CONFIG);
        if (!config) {
          throw new Error('Cannot start App without JWT config');
        }
        return config;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    EmailModule,
  ],
})
export class AppModule {}
