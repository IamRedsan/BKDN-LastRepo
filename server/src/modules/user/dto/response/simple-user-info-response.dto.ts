export class SimpleUserInfoResponseDto {
  username: string;
  name: string;
  avatar: string;
  bio?: string | null;
  isFollowing: boolean;
}
