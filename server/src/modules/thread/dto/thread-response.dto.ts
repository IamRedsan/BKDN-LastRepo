import { Status, Visibility } from 'src/common/enums/thread.enum';
import { Media } from 'src/common/schemas/media.schema';

export class UserInfoDto {
  name: string;
  username: string;
  avatar: string;
}

export class ThreadResponseDto {
  _id: string;
  parentThreadId: string | null;
  content: string;
  status: Status;
  visibility: Visibility;
  reactionNum: number;
  sharedNum: number;
  commentNum: number;
  // hostedUser: string;
  reactionBy: string[];
  reThreadBy: string[];
  media: Media[];
  isLiked: boolean;
  isReThreaded: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: UserInfoDto;
}
