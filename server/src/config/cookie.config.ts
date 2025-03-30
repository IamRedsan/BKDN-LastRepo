import { registerAs } from '@nestjs/config';

export default registerAs('cookie', () => ({
  name: 'accessToken',
  httpOnly: true,
  secure: false,
  sameSite: 'strict',
  maxAge: 3600000,
}));
