import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../../common/schemas/user.schema';
import { EMAIL_CONFIG } from 'src/common/constant/register-name.config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
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

  async sendVerificationEmail(user: User, verificationData: any): Promise<boolean> {
    const emailConfig = this.configService.get(EMAIL_CONFIG);
    const { token, name, username } = verificationData;

    // Create verification link
    const verificationLink = `${emailConfig.verificationUrl}?token=${token}`;

    // Email content
    const mailOptions = {
      from: emailConfig.from || 'no-reply@example.com',
      to: user.email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to our platform!</h1>
        <p>Hello ${name || username || 'there'},</p>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }
}
