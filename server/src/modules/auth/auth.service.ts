import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { COOKIE_CONFIG, JWT_CONFIG } from '../../common/constant/register-name-config';
import { RegisterRequestDto } from './dto/request/register-request.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { EmailService } from '../email/email.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { RegisterResponseDto } from './dto/response/register-response.dto';
import { Language, Theme } from 'src/common/enums/user-option.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private userService: UserService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginRequestDto, res: Response): Promise<LoginResponseDto> {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);
    if (!user) {
      return {
        isSuccess: false,
      };
    }

    const jwtConfig = this.configService.get(JWT_CONFIG);
    if (!user.isEmailVerified) {
      const emailToken = this.jwtService.sign(
        { email: user.email },
        { expiresIn: jwtConfig.verifyTokenExpiresIn },
      );

      this.emailService.sendVerificationEmail(emailToken);
      return {
        emailToken: this.jwtService.sign(
          {
            email: user.email,
          },
          {
            expiresIn: jwtConfig.verifyTokenExpiresIn,
          },
        ),
        role: user.role,
        isBanned: user.isBanned,
        isEmailVerified: user.isEmailVerified,
        isSuccess: false,
      };
    }

    if (user.isBanned) {
      return {
        role: user.role,
        isBanned: user.isBanned,
        isEmailVerified: user.isEmailVerified,
        isSuccess: true,
      };
    }
    const accessToken = this.jwtService.sign(
      { userId: user._id.toString() },
      { expiresIn: jwtConfig.expiresIn },
    );
    const refreshToken = this.jwtService.sign(
      { userId: user._id.toString() },
      { expiresIn: jwtConfig.refreshTokenExpiresIn },
    );

    const cookieConfig = this.configService.get(COOKIE_CONFIG);
    res.cookie('accessToken', accessToken, cookieConfig);
    res.cookie('refreshToken', refreshToken, {
      ...cookieConfig,
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
    });

    return {
      role: user.role,
      isBanned: user.isBanned,
      isEmailVerified: user.isEmailVerified,
      isSuccess: true,
    };
  }

  async register(registerDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const { email, password, username, name } = registerDto;

    if (password !== registerDto.repassword) {
      throw new BadRequestException('Passwords do not match');
    }

    let existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      return {
        isSuccess: false,
      };
    }

    existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      return {
        isSuccess: false,
      };
    }

    const newUser = await this.userService.register({
      email,
      username,
      name,
      havePassword: true,
      password: await bcrypt.hash(password, 10),
      isEmailVerified: false,
      role: UserRole.USER,
      theme: Theme.SYSTEM,
      language: Language.EN,
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
    });

    const emailToken = this.jwtService.sign(
      { email: newUser.email },
      { expiresIn: this.configService.get(JWT_CONFIG).verifyTokenExpiresIn },
    );

    this.emailService.sendVerificationEmail(emailToken);

    return {
      emailToken: emailToken,
      isSuccess: true,
    };
  }

  private generateTemporaryUsername(): string {
    // Tạo timestamp hiện tại
    const timestamp = Date.now();
    // Tạo chuỗi ngẫu nhiên 6 ký tự
    const randomString = Math.random().toString(36).substring(2, 8);
    // Kết hợp timestamp và random string để đảm bảo unique
    return `user_${timestamp}_${randomString}`;
  }

  async validateGoogleUser(googleId: string, name: string, email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      const newUser = await this.userService.register({
        email,
        name,
        googleId,
        username: this.generateTemporaryUsername(),
        isEmailVerified: true,
        role: UserRole.USER,
        havePassword: false,
        theme: Theme.SYSTEM,
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
        requiresUsernameChange: true,
      });
      return newUser;
    }

    if (!user.googleId) {
      user.googleId = googleId;
      user.isEmailVerified = true;
      await this.userService.update(user._id.toString(), user);
    }

    return user;
  }

  async googleLogin(user: any, res: Response) {
    const jwtConfig = this.configService.get(JWT_CONFIG);

    if (user.isBanned) {
      return null; //redirect login
    }

    const accessToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: jwtConfig.expiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: jwtConfig.refreshTokenExpiresIn },
    );

    const cookieConfig = this.configService.get(COOKIE_CONFIG);
    res.cookie('accessToken', accessToken, cookieConfig);
    res.cookie('refreshToken', refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      //redirect home page
      user: {
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        isBanned: user.isBanned,
        followers: user.followers,
        following: user.following,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        requiresUsernameChange: user.requiresUsernameChange,
        havePassword: user.havePassword,
      },
    };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const { email } = decoded;
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      user.isEmailVerified = true;

      await this.userService.update(user._id.toString(), user);

      return {
        message: 'Email verified successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async refreshToken(refreshToken: string, res: Response) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = await this.userService.findById(decoded.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const jwtConfig = this.configService.get(JWT_CONFIG);
      const newAccessToken = this.jwtService.sign(
        { userId: user._id },
        { expiresIn: jwtConfig.expiresIn },
      );

      const newRefreshToken = this.jwtService.sign(
        { userId: user._id },
        { expiresIn: jwtConfig.refreshTokenExpiresIn },
      );

      const cookieConfig = this.configService.get(COOKIE_CONFIG);
      res.cookie('accessToken', newAccessToken, cookieConfig);
      res.cookie('refreshToken', newRefreshToken, {
        ...cookieConfig,
        maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
      });

      return {
        message: 'Tokens refreshed successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async resendVerificationEmail(emailToken: string) {
    await this.emailService.sendVerificationEmail(emailToken);
  }
}
