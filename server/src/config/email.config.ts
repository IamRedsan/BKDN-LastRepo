import { registerAs } from '@nestjs/config';
import { EMAIL_CONFIG } from 'src/common/constant/register-name.config';

export default registerAs(EMAIL_CONFIG, () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  from: process.env.EMAIL_FROM || 'noreply@example.com',
  verificationUrl: process.env.EMAIL_VERIFICATION_URL || 'http://localhost:4000/verify-email',
})); 