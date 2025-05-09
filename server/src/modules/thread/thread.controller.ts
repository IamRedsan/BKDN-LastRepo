import { Multer } from 'multer';
import {
  Controller,
  Get,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Param,
  Post,
  Put,
  Body,
  UploadedFiles,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { RekognitionService } from '../rekognition/rekognition.service';
import { OpenAIService } from '../openai/openai.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ThreadDetailResponseDto } from './dto/thread-detail-response.dto';
import { ThreadCreateUpdateRequestDto } from './dto/request/thread-ce-request.dto';
import { ThreadResponseDto } from './dto/thread-response.dto';
import * as sharp from 'sharp';

@Controller('thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly rekognitionService: RekognitionService,
    private readonly openAIService: OpenAIService,
  ) {}

  @Get('/detail/:threadId')
  @HttpCode(HttpStatus.OK)
  async getThreadDetail(
    @Req() req: Request,
    @Param('threadId') threadId: string,
  ): Promise<ThreadDetailResponseDto> {
    const currentUsername = req.user.username;
    if (!threadId) {
      throw new BadRequestException('Thread ID is required');
    }
    return this.threadService.getThreadDetail(threadId, currentUsername);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('media'))
  async createThread(
    @Req() req: Request,
    @Body() createThreadDto: ThreadCreateUpdateRequestDto,
    @UploadedFiles() media: Multer.File[],
  ): Promise<ThreadResponseDto> {
    const { content, visibility, parentThreadId } = createThreadDto;

    if (!content || !visibility) {
      throw new BadRequestException('Content and visibility are required');
    }

    // Check content toxicity
    const censoredContent = await this.openAIService.censorComment(content);

    // Check image toxicity (if media are provided)
    let isToxicImage = false;
    // if (media && media.length > 0) {
    //   for (const image of media) {
    //     // Resize and compress the image if it exceeds 5 MB
    //     let processedBuffer = image.buffer;
    //     if (image.buffer.length > 5242880) {
    //       processedBuffer = await sharp(image.buffer)
    //         .resize({ width: 1920 }) // Resize to a maximum width of 1920px while maintaining aspect ratio
    //         .jpeg({ quality: 70 }) // Compress to JPEG with 80% quality
    //         .toBuffer();
    //     }

    //     const moderationResult = await this.rekognitionService.moderateImage(processedBuffer);
    //     if (moderationResult.isToxic) {
    //       isToxicImage = true;
    //       break;
    //     }
    //   }
    // }

    if (isToxicImage) {
      throw new BadRequestException('One or more images contain inappropriate content');
    }

    // Create thread
    const userId = req.user._id; // Assuming `req.user` contains the authenticated user's info
    return this.threadService.createThread(
      userId,
      censoredContent,
      visibility,
      parentThreadId,
      media,
    );
  }

  @Put('/')
  @UseInterceptors(FilesInterceptor('media'))
  async editThread(
    @Req() req: Request,
    // @Param('threadId') threadId: string,
    @Body() editThreadDto: ThreadCreateUpdateRequestDto,
    @UploadedFiles() media: Multer.File[],
  ): Promise<ThreadResponseDto> {
    const { content, visibility, oldMedia, threadId } = editThreadDto;
    const formattedOldMedia: string[] = JSON.parse(oldMedia);
    if (!content || !visibility) {
      throw new BadRequestException('Content and visibility are required');
    }

    // Check content toxicity
    const censoredContent = await this.openAIService.censorComment(content);

    // Check image toxicity (if media are provided)
    let isToxicImage = false;
    // if (media && media.length > 0) {
    //   for (const image of media) {
    //     // Resize and compress the image if it exceeds 5 MB
    //     let processedBuffer = image.buffer;
    //     if (image.buffer.length > 5242880) {
    //       processedBuffer = await sharp(image.buffer)
    //         .resize({ width: 1920 }) // Resize to a maximum width of 1920px while maintaining aspect ratio
    //         .jpeg({ quality: 80 }) // Compress to JPEG with 80% quality
    //         .toBuffer();
    //     }

    //     const moderationResult = await this.rekognitionService.moderateImage(processedBuffer);
    //     if (moderationResult.isToxic) {
    //       isToxicImage = true;
    //       break;
    //     }
    //   }
    // }

    if (isToxicImage) {
      throw new BadRequestException('One or more images contain inappropriate content');
    }

    // Edit thread
    const userId = req.user._id; // Assuming `req.user` contains the authenticated user's info
    return this.threadService.editThread(
      threadId,
      userId,
      censoredContent,
      visibility,
      media,
      formattedOldMedia,
    );
  }

  @Delete('/:threadId')
  @HttpCode(HttpStatus.OK)
  async deleteThread(
    @Req() req: Request,
    @Param('threadId') threadId: string,
  ): Promise<{ message: string }> {
    const userId = req.user._id;
    await this.threadService.deleteThread(threadId, userId);
    return { message: 'Thread deleted successfully' };
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async searchThreads(
    @Req() req: Request,
    @Query('query') query: string,
  ): Promise<ThreadResponseDto[]> {
    const currentUsername = req.user.username; // Lấy username của người tìm kiếm
    return this.threadService.searchThreads(query, currentUsername);
  }

  @Get('/feed')
  @HttpCode(HttpStatus.OK)
  async getFeedThreads(
    @Req() req: Request,
    @Query('lastCreatedAt') lastCreatedAt?: string,
  ): Promise<ThreadResponseDto[]> {
    const userId = req.user._id;
    const lastCreatedAtDate = lastCreatedAt ? new Date(lastCreatedAt) : undefined;
    return this.threadService.getFeedThreads(userId, lastCreatedAtDate);
  }
}
