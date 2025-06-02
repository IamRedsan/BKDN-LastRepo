import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status, Visibility } from '../enums/thread.enum';
import { Media, MediaSchema } from './media.schema'; // import Media và MediaSchema

@Schema({ timestamps: true })
export class Thread extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Thread', default: null })
  parentThreadId?: Types.ObjectId;

  // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // hosted_user: Types.ObjectId;

  @Prop({ type: String })
  content: string;

  @Prop({
    type: String,
    enum: ['CREATE_DONE', 'HIDE'],
    default: 'HIDE',
  })
  status: Status;

  @Prop({
    type: String,
    enum: ['PUBLIC', 'PRIVATE', 'FOLLOWER_ONLY'],
    default: 'PUBLIC',
  })
  visibility: Visibility;

  @Prop({ default: 0 })
  reactionNum: number;

  @Prop({ default: 0 })
  sharedNum: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  reactionBy: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  reThreadBy: Types.ObjectId[];

  @Prop({ type: [MediaSchema], default: [] })
  media: Media[];

  @Prop({ default: 0 })
  reportedNum: number;

  @Prop({ type: [Number], default: [] }) // float vector
  embedding: number[];
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
ThreadSchema.index({ content: 1 });
