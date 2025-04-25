import { ThreadResponseDto } from './thread-response.dto';

export class ThreadDetailResponseDto {
  parentThread: ThreadResponseDto | null;
  mainThread: ThreadResponseDto;
  comments: ThreadResponseDto[];
}
