import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';
import { defaultAvatarUrl, defaultWallpaperUrl } from '../constant/default-varaible';
import { Language } from '../enums/user-option.enum';
import { Theme } from '../enums/user-option.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  password?: string;

  @Prop()
  googleId?: string;

  @Prop()
  name: string;

  @Prop({ default: defaultAvatarUrl })
  avatar?: string;

  @Prop({ default: defaultWallpaperUrl })
  wallpaper?: string;

  @Prop({ type: String, enum: Theme, default: Theme.SYSTEM })
  theme: Theme;

  @Prop({ type: String, enum: Language, default: Language.EN })
  language: Language;

  @Prop()
  bio?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: false })
  requiresUsernameChange: boolean;

  @Prop({ default: false })
  havePassword: boolean;

  // @Prop({ default: false })
  // is2FAEnabled: boolean;

  // @Prop()
  // twoFactorSecret?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  following: Types.ObjectId[];

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
