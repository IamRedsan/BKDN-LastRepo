import { Multer } from 'multer';
import { Visibility } from 'src/common/enums/thread.enum';

export class ThreadCreateUpdateRequestDto {
  threadId?: string;
  parentThreadId?: string | null;
  content: string;
  visibility: Visibility;
  oldMedia?: string;
}
