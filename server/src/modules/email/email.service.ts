import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from 'src/common/constant/register-name-config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    const emailConfig = this.configService.get(EMAIL_CONFIG);

    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure || false,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });
  }

  async sendVerificationEmail(emailToken: string): Promise<void> {
    const emailConfig = this.configService.get(EMAIL_CONFIG);

    try {
      // Giải mã token để lấy payload
      const payload = this.jwtService.verify(emailToken);
      const { email } = payload;

      // Tạo link xác minh
      const verificationLink = `${emailConfig.verificationUrl}?token=${emailToken}`;

      // Nội dung email
      const mailOptions = {
        from: emailConfig.from || 'no-reply@example.com',
        to: email,
        subject: 'Verify your email address',
        html: `
          <h1>Welcome to our platform!</h1>
          <p>Hello there,</p>
          <p>Thank you for registering. Please click the link below to verify your email address:</p>
          <a href="${verificationLink}">${verificationLink}</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        `,
      };

      // Gửi email
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      // Xử lý lỗi nếu token không hợp lệ hoặc hết hạn
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired email token');
      }
      // Xử lý các lỗi khác (nếu có)
      throw new BadRequestException('Failed to send verification email:', error.message);
    }
  }
}
