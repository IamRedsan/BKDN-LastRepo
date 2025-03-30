import { registerAs } from '@nestjs/config';

export default registerAs('cors', () => ({
  origin: [
    'http://localhost:3000',
    'http://localhost:4000',
    'https://accounts.google.com',
  ],
  credentials: true,
}));
