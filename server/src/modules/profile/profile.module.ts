import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserModule } from '../user/user.module';
import { ThreadModule } from '../thread/thread.module';
import { ProfileController } from './profile.controller';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';

@Module({
  imports: [UserModule, ThreadModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ProfileController);
  }
}
