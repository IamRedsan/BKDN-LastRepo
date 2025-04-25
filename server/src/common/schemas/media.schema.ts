import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Media {
  @Prop({ required: true }) // URL của ảnh hoặc video
  url: string;

  @Prop({ enum: ['image', 'video'], required: true })
  type: 'image' | 'video';

  @Prop() // ví dụ ảnh preview cho video
  thumbnail?: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
