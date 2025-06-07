import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThreadController } from './thread.controller';
import { ThreadService } from './thread.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Thread, ThreadSchema } from 'src/common/schemas/thread.schema';
import { UserModule } from '../user/user.module';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { OpenAIModule } from '../openai/openai.module';
import { RekognitionModule } from '../rekognition/rekognition.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Thread.name, schema: ThreadSchema }]),
    UserModule,
    OpenAIModule,
    RekognitionModule,
    CloudinaryModule,
    NotificationModule,
  ],
  controllers: [ThreadController],
  providers: [ThreadService],
  exports: [ThreadService],
})
export class ThreadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ThreadController);
  }
}
