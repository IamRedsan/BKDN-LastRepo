import { Rekognition } from 'aws-sdk';

export function isToxicImage(labels: Rekognition.ModerationLabel[], threshold = 70): boolean {
  return labels.some(label => label.Confidence >= threshold);
}
