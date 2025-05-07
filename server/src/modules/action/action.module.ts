import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ActionController } from './action.controller';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ActionService } from './action.service';
import { ThreadModule } from '../thread/thread.module';

@Module({
  imports: [UserModule, NotificationModule, ThreadModule],
  controllers: [ActionController],
  providers: [ActionService],
})
export class ActionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ActionController);
  }
}
