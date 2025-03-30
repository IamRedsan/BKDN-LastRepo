import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { COOKIE_CONFIG, JWT_CONFIG } from '../../common/constant/register-name.config';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { RegisterRequestDto } from './dto/request/register-request.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { EmailService } from '../email/email.service';
import { User } from 'src/common/schemas/user.schema';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { RegisterResponseDto } from './dto/response/register-response.dto';

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
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      const verificationData = {
        email: user.email,
        username: user.username,
        name: user.name,
        password: user.password,
        userId: user._id,
        googleId: user.googleId,
      };

      this.sendVerificationEmail(user, verificationData);
      throw new UnauthorizedException(
        'Please verify your email before logging in. A new verification email has been sent.',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Your account is not active. Please contact support.');
    }

    const jwtConfig = this.configService.get(JWT_CONFIG);

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
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
    });

    return {
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    };
  }

  private async sendVerificationEmail(user: User, verificationData: any) {
    const jwtConfig = this.configService.get(JWT_CONFIG);

    const dataWithToken = {
      ...verificationData,
      token: this.jwtService.sign(verificationData, {
        expiresIn: jwtConfig.verifyTokenExpiresIn,
      }),
    };

    this.emailService.sendVerificationEmail(user, dataWithToken).catch(error => {
      console.error('Error sending verification email:', error);
    });
  }

  async register(registerDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const { email, password, username, name } = registerDto;

    if (password !== registerDto.repassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      if (existingUser.googleId) {
        const verificationData = {
          email,
          username,
          name,
          password: await bcrypt.hash(password, 10),
          googleId: existingUser.googleId,
          userId: existingUser._id,
          isGoogleUser: true,
        };

        this.sendVerificationEmail(existingUser, verificationData);

        return {
          user: {
            id: existingUser._id.toString(),
            email: existingUser.email,
            username: existingUser.username,
            name: existingUser.name,
            role: existingUser.role,
            status: existingUser.status,
          },
        };
      }

      throw new ConflictException('Email already registered');
    }

    const newUser = await this.userService.register({
      email,
      username,
      name,
      havePassword: true,
      password: await bcrypt.hash(password, 10),
      status: UserStatus.INACTIVE,
      isEmailVerified: false,
      role: UserRole.USER,
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
    });

    this.sendVerificationEmail(newUser, {
      email: newUser.email,
      username: newUser.username,
      name: newUser.name,
      userId: newUser._id,
    });

    return {
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
      },
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
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        role: UserRole.USER,
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
      user.status = UserStatus.ACTIVE;
      user.isEmailVerified = true;
      await this.userService.update(user._id.toString(), user);
    }

    return user;
  }

  async googleLogin(user: any, res: Response) {
    const jwtConfig = this.configService.get(JWT_CONFIG);

    const accessToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: jwtConfig.expiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: jwtConfig.refreshTokenExpiresIn },
    );

    const cookieConfig = this.configService.get(COOKIE_CONFIG);
    res.cookie(cookieConfig.name, accessToken, cookieConfig);
    res.cookie('refreshToken', refreshToken, {
      ...cookieConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: {
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
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
      const { userId, email, username, name, password, googleId, isGoogleUser } = decoded;

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (isGoogleUser) {
        user.email = email;
        user.username = username;
        user.name = name;
        user.password = password;
        user.isEmailVerified = true;
        user.status = UserStatus.ACTIVE;
        user.googleId = googleId;
      } else {
        user.isEmailVerified = true;
        user.status = UserStatus.ACTIVE;
      }

      await this.userService.update(user._id.toString(), user);

      return {
        message: 'Email verified successfully',
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.name,
          status: user.status,
        },
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
          status: user.status,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
