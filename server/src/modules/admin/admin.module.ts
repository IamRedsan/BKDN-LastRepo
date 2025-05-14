import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserService } from '../user/user.service';
import { ThreadService } from '../thread/thread.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../common/schemas/user.schema';
import { Thread, ThreadSchema } from '../../common/schemas/thread.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Thread.name, schema: ThreadSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [UserService, ThreadService],
})
export class AdminModule {}
