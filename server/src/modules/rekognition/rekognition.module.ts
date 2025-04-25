import { Module } from '@nestjs/common';
import { RekognitionService } from './rekognition.service';
import { RekognitionController } from './rekognition.controller';

@Module({
  providers: [RekognitionService],
  controllers: [RekognitionController],
  exports: [RekognitionService],
})
export class RekognitionModule {}
