import { Multer } from 'multer';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Thread } from 'src/common/schemas/thread.schema';
import { UserService } from '../user/user.service';
import { Status, Visibility } from 'src/common/enums/thread.enum';
import { ThreadResponseDto } from './dto/thread-response.dto';
import { ThreadDetailResponseDto } from './dto/thread-detail-response.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { Media } from 'src/common/schemas/media.schema';
import { OpenAIService } from '../openai/openai.service';
import { cosineSimilarity } from 'src/common/utils/cosineSimilarity';
import { updateUserInterestVector } from 'src/common/utils/updateUserVector';
import { VIEW_THREAD_DETAIL_LEARNING_RATE } from 'src/common/constant/learning-rate';
import { NotificationService } from '../notification/notification.service';
import { NotificationContentEnum, NotificationTypeEnum } from 'src/common/enums/notification.enum';

@Injectable()
export class ThreadService {
  constructor(
    @InjectModel(Thread.name) private readonly threadModel: Model<Thread>,
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly openAiService: OpenAIService,
    private readonly notificationService: NotificationService,
  ) {}

  async findReportedThreads(minReports: number) {
    return this.threadModel
      .find({
        $or: [{ reportedNum: { $gte: minReports } }, { status: { $in: ['HIDE'] } }],
      })
      .populate('user', 'username name avatar') // Lấy thông tin user liên quan
      .exec();
  }

  async findById(threadId: string): Promise<any | null> {
    const thread = await this.threadModel.findById(threadId).populate({
      path: 'user',
      select: 'username name avatar ', // Lấy thêm thông tin followers
    });
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    return thread;
  }

  async getThreadsByUsername(
    username: string,
    currentUsername: string,
  ): Promise<{
    threads: ThreadResponseDto[];
    reThreads: ThreadResponseDto[];
  }> {
    // Kiểm tra xem đây là chính người dùng hay người khác
    const isCurrentUser = username === currentUsername;

    // Tìm user theo username
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Nếu là chính người dùng, lấy tất cả threads và reThreads
    if (isCurrentUser) {
      const threads = await this.threadModel
        .find({ user: user._id, parentThreadId: null })
        .sort({ createdAt: -1 }) // Sắp xếp theo updatedAt giảm dần
        .populate({
          path: 'user',
          select: 'name avatar username', // Chỉ lấy name và avatar
        })
        .exec();

      const reThreads = await this.threadModel
        .find({ reThreadBy: user._id })
        .sort({ createdAt: -1 }) // Sắp xếp theo updatedAt giảm dần
        .populate({
          path: 'user',
          select: 'namatar ue avsername', // Chỉ lấy name và avatar
        })
        .exec();

      return {
        threads: await Promise.all(
          threads.map(thread => this.mapToThreadResponseDto(thread, user._id as string)),
        ),
        reThreads: await Promise.all(
          reThreads.map(reThread => this.mapToThreadResponseDto(reThread, user._id as string)),
        ),
      };
    }

    // Nếu là người khác, cần kiểm tra visibility
    const currentUser = await this.userService.findByUsername(currentUsername);
    if (!currentUser) {
      throw new BadRequestException('Current user not found');
    }

    const isFollower = user.followers.some(
      followerId => followerId.toString() === currentUser._id.toString(),
    );
    // Lấy thread dựa trên visibility
    const visibilityFilter = isFollower
      ? { $in: [Visibility.PUBLIC, Visibility.FOLLOWER_ONLY] } // Nếu là follower, lấy PUBLIC và FOLLOWER_ONLY
      : { $eq: Visibility.PUBLIC }; // Nếu không phải follower, chỉ lấy PUBLIC

    const threads = await this.threadModel
      .find({ user: user._id, visibility: visibilityFilter, parentThreadId: null })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'name avatar username', // Chỉ lấy name và avatar
      })
      .exec();

    const reThreads = await this.threadModel
      .find({ reThreadBy: user._id, visibility: visibilityFilter, parentThreadId: null })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'name avatar username', // Chỉ lấy name và avatar
      })
      .exec();
    return {
      threads: await Promise.all(
        threads.map(thread => this.mapToThreadResponseDto(thread, currentUser._id as string)),
      ),
      reThreads: await Promise.all(
        reThreads.map(reThread => this.mapToThreadResponseDto(reThread, currentUser._id as string)),
      ),
    };
  }

  async getThreadDetail(
    threadId: string,
    currentUsername: string,
  ): Promise<ThreadDetailResponseDto> {
    // Tìm thread chính
    const mainThread: any = await this.threadModel
      .findById(threadId)
      .populate({
        path: 'user',
        select: 'username name avatar followers', // Lấy thêm thông tin followers
        populate: {
          path: 'followers', // Populate followers để lấy đầy đủ thông tin
          select: '_id', // Chỉ lấy _id của followers
        },
      })
      .exec();
    if (!mainThread) {
      throw new NotFoundException('Thread not found');
    }

    // Kiểm tra quyền truy cập nếu cần (visibility)
    const currentUser = await this.userService.findByUsername(currentUsername);
    if (!currentUser) {
      throw new BadRequestException('Current user not found');
    }
    if (
      mainThread.visibility === Visibility.FOLLOWER_ONLY &&
      mainThread.user._id.toString() !== currentUser._id.toString()
    ) {
      const isFollower = mainThread.user.followers?.some(
        (follower: any) => follower._id.toString() === currentUser._id.toString(),
      );
      if (!isFollower) {
        throw new ForbiddenException('You do not have permission to view this thread');
      }
    }

    if (
      mainThread.visibility === Visibility.PRIVATE &&
      mainThread.user._id.toString() !== currentUser._id.toString()
    ) {
      throw new ForbiddenException('You do not have permission to view this thread');
    }

    // ✅ Cập nhật vector quan tâm của user (nếu có embedding)
    if (mainThread.embedding?.length) {
      if (!currentUser.interestVector || currentUser.interestVector.length === 0) {
        currentUser.interestVector = mainThread.embedding;
      } else {
        currentUser.interestVector = updateUserInterestVector(
          currentUser.interestVector,
          mainThread.embedding,
          VIEW_THREAD_DETAIL_LEARNING_RATE,
        );
      }
      await currentUser.save();
    }

    // Lấy thread cha (nếu có)
    let parentThread = null;
    if (mainThread.parentThreadId) {
      parentThread = await this.threadModel
        .findById(mainThread.parentThreadId)
        .populate({
          path: 'user',
          select: 'username name avatar', // Lấy thông tin tác giả
        })
        .exec();

      if (!parentThread) {
        throw new NotFoundException('Parent thread not found');
      }
    }

    // Lấy danh sách các comment liên quan đến thread
    const comments = await this.threadModel
      .find({ parentThreadId: new Types.ObjectId(threadId) })
      .sort({ createdAt: -1 })
      .populate({
        path: 'user',
        select: 'username name avatar', // Lấy thông tin tác giả
      })
      .exec();

    // Chuẩn bị dữ liệu trả về
    return {
      parentThread: parentThread
        ? await this.mapToThreadResponseDto(parentThread, currentUser._id as string)
        : null,
      mainThread: await this.mapToThreadResponseDto(mainThread, currentUser._id as string),
      comments: await Promise.all(
        comments.map(async comment =>
          this.mapToThreadResponseDto(comment, currentUser._id as string),
        ),
      ),
    };
  }

  async createThread(
    userId: string,
    content: string,
    visibility: string,
    parrentThreadId?: string,
    media?: Multer.File[],
  ): Promise<ThreadResponseDto> {
    let formattedUploadedMedia: Media[] = [];
    if (media) {
      const uploadedMedia = await this.cloudinaryService.uploadImages(media);
      if (uploadedMedia) {
        formattedUploadedMedia = uploadedMedia.map((image: UploadApiResponse) => ({
          url: image.secure_url,
          type: 'image',
        }));
      } else {
        throw new BadRequestException('Error uploading images');
      }
    }
    const censoredContent = await this.openAiService.censorComment(content);
    const embedding = await this.openAiService.generateEmbedding(censoredContent);

    const thread = new this.threadModel({
      parentThreadId: parrentThreadId ? new Types.ObjectId(parrentThreadId) : null,
      user: new Types.ObjectId(userId),
      censoredContent,
      visibility: parrentThreadId ? Visibility.PUBLIC : visibility,
      media: formattedUploadedMedia,
      embedding,
    });

    const user = await this.userService.findById(userId);
    const savedThread: any = await thread.save();
    const commentNum = await this.threadModel.countDocuments({ parentThreadId: thread._id });

    if (parrentThreadId) {
      const parentThread: any = await this.threadModel.findById(parrentThreadId).populate({
        path: 'user',
        select: 'username',
      });
      if (parentThread && parentThread.user && parentThread.user._id.toString() !== userId) {
        await this.notificationService.createNotification({
          senderUsername: user.username,
          receiverUsername: parentThread.user.username,
          type: NotificationTypeEnum.COMMENT,
          threadId: parentThread._id.toString(),
          threadContent: parentThread.content,
          content: NotificationContentEnum.COMMENT,
        });
      }
    }

    return {
      _id: savedThread._id,
      content: savedThread.content,
      visibility: savedThread.visibility,
      createdAt: savedThread.createdAt,
      updatedAt: savedThread.updatedAt,
      media: savedThread.media,
      reactionNum: savedThread.reactionNum,
      sharedNum: savedThread.sharedNum,
      reThreadBy: savedThread.reThreadBy,
      commentNum: commentNum,
      status: savedThread.status,
      parentThreadId: savedThread.parentThreadId,
      reactionBy: savedThread.reactionBy,
      isLiked: thread.reactionBy.includes(new Types.ObjectId(userId)),
      isReThreaded: thread.reThreadBy.includes(new Types.ObjectId(userId)),
      user: {
        username: user.username,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  async editThread(
    threadId: string,
    userId: string,
    content: string,
    visibility: string,
    media?: Multer.File[],
    oldMedia?: string[],
  ): Promise<ThreadResponseDto> {
    // Tìm thread trong DB
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    // Kiểm tra quyền chỉnh sửa
    if (thread.user.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to edit this thread');
    }

    // Lấy danh sách media hiện tại từ DB
    const currentMediaUrls = thread.media.map(media => media.url);
    const mediaToDelete = currentMediaUrls.filter(url => !oldMedia?.includes(url));

    // Xóa các media không còn được giữ lại khỏi Cloudinary
    if (mediaToDelete.length > 0) {
      await this.cloudinaryService.deleteImages(mediaToDelete);
    }

    // Xóa các media không còn được giữ lại khỏi thread
    thread.media = thread.media.filter(m => !mediaToDelete.includes(m.url));

    // Upload các media mới (nếu có)
    let updatedMedia = thread.media; // Giữ lại media cũ
    if (media && media.length > 0) {
      const uploadedMedia = await this.cloudinaryService.uploadImages(media);
      updatedMedia = [
        ...updatedMedia.filter(m => oldMedia?.includes(m.url)), // Giữ lại media cũ được giữ lại
        ...uploadedMedia.map((image: UploadApiResponse) => ({
          url: image.secure_url,
          type: 'image' as 'image',
        })),
      ];
    }

    if (content.trim() === '') {
      throw new BadRequestException('Content cannot be empty');
    }

    let finalContent = thread.content;
    let embedding = thread.embedding; // Giữ lại embedding cũ

    if (content !== thread.content) {
      const censoredContent = await this.openAiService.censorComment(content);
      finalContent = censoredContent;
      embedding = await this.openAiService.generateEmbedding(censoredContent);
    }

    const updateData: any = {
      content: finalContent,
      visibility,
      media: updatedMedia,
    };

    const updatedThread = await this.threadModel
      .findByIdAndUpdate(threadId, updateData, { new: true })
      .populate({
        path: 'user',
        select: 'username name avatar',
      });

    if (!updatedThread) {
      throw new NotFoundException('Thread not found');
    }

    // Trả về dữ liệu thread đã cập nhật
    return this.mapToThreadResponseDto(updatedThread, userId);
  }

  async deleteThread(threadId: string, userId: string): Promise<void> {
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    if (thread.user.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to edit this thread');
    }
    const currentMediaUrls = thread.media.map(media => media.url);
    if (currentMediaUrls.length > 0) {
      await this.cloudinaryService.deleteImages(currentMediaUrls);
    }

    await this.threadModel.updateMany(
      { parentThreadId: new Types.ObjectId(threadId) },
      { $set: { parentThreadId: null } },
    );

    if (thread.user.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to delete this thread');
    }
    await this.threadModel.findByIdAndDelete(threadId);
  }

  async searchThreads(query: string, currentUsername: string): Promise<ThreadResponseDto[]> {
    const currentUser = await this.userService.findByUsername(currentUsername);
    if (!currentUser) {
      throw new BadRequestException('Current user not found');
    }

    const regex = new RegExp(query, 'i'); // 'i' = case-insensitive

    const threads: any = await this.threadModel
      .find({
        content: { $regex: regex },
        $or: [
          { visibility: Visibility.PUBLIC },
          {
            visibility: Visibility.FOLLOWER_ONLY,
            user: { $in: currentUser.following }, // Chỉ bài của người mình follow
          },
        ],
      })
      .populate('user', 'username name avatar')
      .exec();
    const result = await Promise.all(
      threads.map(thread => this.mapToThreadResponseDto(thread, currentUser._id.toString())),
    );
    return result;
  }

  async getFeedThreads(
    userId: string,
    interestVector: number[],
    excludedIds: string[] = [],
  ): Promise<ThreadResponseDto[]> {
    const limit = 5;

    const friends = await this.userService.getFriends(userId);

    const threads = await this.threadModel
      .find({
        _id: { $nin: excludedIds },
        $or: [
          { user: userId },
          {
            user: { $in: friends },
            visibility: { $in: [Visibility.PUBLIC, Visibility.FOLLOWER_ONLY] },
          },
          {
            user: { $nin: [...friends, userId] },
            visibility: Visibility.PUBLIC,
          },
        ],
        embedding: { $exists: true, $ne: [] },
      })
      .populate({
        path: 'user',
        select: 'username name avatar',
      })
      .limit(limit * 3);

    const scoredThreads = threads.map(thread => ({
      thread,
      score: cosineSimilarity(interestVector, thread.embedding || []),
      isFriend: friends.map(f => f.toString()).includes(thread.user._id.toString()),
    }));

    scoredThreads.sort((a: any, b: any) => {
      if (b.score !== a.score) return b.score - a.score; // Ưu tiên độ tương đồng
      if (b.isFriend !== a.isFriend) return Number(b.isFriend) - Number(a.isFriend); // Ưu tiên bạn bè
      return b.thread.createdAt.getTime() - a.thread.createdAt.getTime(); // Ưu tiên bài mới hơn
    });

    const topThreads = scoredThreads.slice(0, limit).map(t => t.thread);

    const result = await Promise.all(
      topThreads.map(thread => this.mapToThreadResponseDto(thread, userId)),
    );

    return result;
  }

  async banThreadAndUser(threadId: string): Promise<ThreadResponseDto> {
    // Tìm thread theo ID
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Cập nhật trạng thái thread thành HIDE
    thread.status = Status.HIDE;
    await thread.save();

    // Ban user chủ thread
    const user = await this.userService.findById(thread.user.toString());
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isBanned = true;
    await user.save();
    const result = await this.mapToThreadResponseDto(thread, user._id.toString());
    return result;
  }

  async approveThread(threadId: string): Promise<ThreadResponseDto> {
    // Tìm thread theo ID
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    // Cập nhật trạng thái thread thành APPROVED
    thread.status = Status.CREATE_DONE;
    thread.reportedNum = 0; // Đặt lại số lượng báo cáo về 0
    await thread.save();
    // Trả về thread đã được phê duyệt
    const result = await this.mapToThreadResponseDto(thread, thread.user.toString());
    return result;
  }

  // thread.service.ts

  async updateAllThreadsWithEmbedding(): Promise<number> {
    const threads = await this.threadModel.find({
      embedding: { $exists: false },
    });

    let updatedCount = 0;

    for (const thread of threads) {
      const content = thread.content?.trim();
      if (!content) continue;

      try {
        const embedding = await this.openAiService.generateEmbedding(content);
        if (embedding && embedding.length > 0) {
          thread.embedding = embedding;
          await thread.save();
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error embedding thread ${thread._id}:`, error.message);
        continue;
      }
    }

    return updatedCount;
  }

  public async mapToThreadResponseDto(
    thread: any,
    currentUserId: string,
  ): Promise<ThreadResponseDto> {
    const commentNum = await this.threadModel.countDocuments({ parentThreadId: thread._id });
    return {
      _id: thread._id,
      content: thread.content,
      visibility: thread.visibility,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      media: thread.media,
      reactionNum: thread.reactionNum,
      sharedNum: thread.sharedNum,
      reThreadBy: thread.reThreadBy,
      commentNum: commentNum,
      status: thread.status,
      parentThreadId: thread.parentThreadId,
      reactionBy: thread.reactionBy,
      isLiked: thread.reactionBy.includes(currentUserId),
      isReThreaded: thread.reThreadBy.includes(currentUserId),
      user: {
        username: thread.user.username,
        name: thread.user.name,
        avatar: thread.user.avatar,
      },
    };
  }
}
