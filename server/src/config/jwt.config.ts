import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';
import { JWT_CONFIG } from 'src/common/constant/register-name-config';

export default registerAs<JwtSignOptions>(JWT_CONFIG, () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  verifyTokenExpiresIn: process.env.JWT_VERIFY_TOKEN_EXPIRES_IN || '24h',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'
}));
