import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { RegisterRequestDto } from './dto/request/register-request.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { RegisterResponseDto } from './dto/response/register-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    try {
      const result = await this.authService.register(registerDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    try {
      const result = await this.authService.login(loginDto, response);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // This endpoint initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user, res);

      if (!result) {
        // Nếu xác thực thất bại, hiển thị thông báo lỗi và đóng cửa sổ
        return res.send(`
          <html>
            <body>
              <script>
                window.opener.postMessage({ success: false }, '*');
                window.close();
              </script>
            </body>
          </html>
        `);
      }

      // Nếu xác thực thành công, đóng cửa sổ và gửi thông tin về parent window
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ success: true }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      // Xử lý lỗi và đóng cửa sổ
      return res.send(`
        <html>
          <body>
            <script>
              alert('An error occurred during authentication.');
              window.close();
            </script>
          </body>
        </html>
      `);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  googleLogout(@Req() req: Request, @Res() res: Response) {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Logout failed', error });
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    this.authService.verifyEmail(token);
    return res.redirect(process.env.FRONTEND_URL + '/auth/verify-success');
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminProfile(@GetUser() user: any) {
    return {
      id: user._id,
      email: user.email,
      role: user.role,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    try {
      await this.authService.refreshToken(refreshToken, response);
      return { message: 'Token refreshed successfully' };
    } catch (error) {
      throw error;
    }
  }

  @Post('resend-email')
  @HttpCode(HttpStatus.OK)
  async resendEmail(@Body('emailToken') emailToken: string) {
    try {
      await this.authService.resendVerificationEmail(emailToken);
      return { message: 'Verification email resent successfully' };
    } catch (error) {
      throw error;
    }
  }
}
