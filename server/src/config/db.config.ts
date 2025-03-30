import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGO_DB_URI || 'mongodb://localhost:27017/mydatabase',
}));
