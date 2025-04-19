import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RekognitionService } from './rekognition.service';
import { Express } from 'express';
import { Multer } from 'multer';

@Controller('image')
export class RekognitionController {
  constructor(private readonly rekognitionService: RekognitionService) {}

  @Post('moderate')
  @UseInterceptors(FileInterceptor('image'))
  async moderateImage(@UploadedFile() file: Multer.File) {
    const moderationResult = await this.rekognitionService.moderateImage(file.buffer);
    return moderationResult;
  }
}
