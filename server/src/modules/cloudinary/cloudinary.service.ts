import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
const streamifier = require('streamifier');
import { File } from 'multer';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadImages(files: File[]): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    return Promise.all(files.map(file => this.uploadImage(file)));
  }

  async deleteImage(imageUrl: string): Promise<any> {
    const publicId = this.extractPublicId(imageUrl);
    if (!publicId) {
      throw new Error('Invalid image URL. Could not extract public_id.');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }

  async deleteImages(imageUrls: string[]): Promise<any[]> {
    return Promise.all(imageUrls.map(url => this.deleteImage(url)));
  }

  private extractPublicId(imageUrl: string): string | null {
    // Ví dụ URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
    const match = imageUrl.match(regex);
    return match ? match[1] : null;
  }
}
