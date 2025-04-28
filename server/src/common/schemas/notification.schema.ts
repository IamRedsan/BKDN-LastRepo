import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationContentEnum, NotificationTypeEnum } from '../enums/notification.enum';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Thread', required: false })
  threadId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['LIKE', 'FOLLOW', 'COMMENT', 'REPOST'],
    default: 'LIKE',
  })
  type: NotificationTypeEnum;

  @Prop({
    type: String,
    enum: [
      'notification.like',
      'notification.follow',
      'notification.comment',
      'notification.repost',
    ],
    default: 'notification.like',
  })
  content: NotificationContentEnum;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
