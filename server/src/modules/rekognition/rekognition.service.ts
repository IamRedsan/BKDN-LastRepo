import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { isToxicImage } from 'src/common/utils/rekcognition.utils';

@Injectable()
export class RekognitionService {
  private rekognition: AWS.Rekognition;

  constructor() {
    AWS.config.update({
      region: process.env.AWS_REGION, // tùy region bạn dùng
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.rekognition = new AWS.Rekognition();
  }

  async moderateImage(imageBuffer: Buffer): Promise<{
    isToxic: boolean;
    labels: AWS.Rekognition.ModerationLabel[];
  }> {
    const params: AWS.Rekognition.DetectModerationLabelsRequest = {
      Image: { Bytes: imageBuffer },
      MinConfidence: 70, // có thể chỉnh cao hơn nếu cần strict
    };

    try {
      const result = await this.rekognition.detectModerationLabels(params).promise();
      const isToxic = isToxicImage(result.ModerationLabels);
      return {
        isToxic,
        labels: result.ModerationLabels,
      };
    } catch (error: any) {
      throw new Error(`Error detecting moderation labels: ${error.message}`);
    }
  }
}
