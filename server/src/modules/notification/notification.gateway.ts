import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NotificationResponseDto } from './dto/response/notification.response';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationGateway');
  private users = new Map<string, string>(); // Map userId -> socketId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, socketId] of this.users) {
      if (socketId === client.id) {
        this.users.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.users.set(userId, client.id);
    this.logger.log(`User ${userId} registered with socket ${client.id}`);
  }

  sendNotification(receiverId: string, notification: NotificationResponseDto) {
    const socketId = this.users.get(receiverId);
    if (socketId) {
      this.server.to(socketId).emit('new_notification', notification);
    }
  }
}
