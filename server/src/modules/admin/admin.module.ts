import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';
import { ThreadModule } from '../thread/thread.module';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';

@Module({
  imports: [UserModule, ThreadModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AdminController);
  }
}
