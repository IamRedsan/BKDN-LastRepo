export class FollowTriggleResponseDto {
  following: {
    username: string;
    name: string;
    avatar: string;
  }[];
  followingCount: number;
}
