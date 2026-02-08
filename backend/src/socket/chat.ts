import { Server, Socket } from 'socket.io';
import prisma from '../utils/prisma';

export const handleChatSend = async (
  io: Server,
  socket: Socket,
  user: { id: string },
  data: { orderId: string; content: string },
  prismaClient: any = prisma
) => {
  try {
    const { orderId, content } = data;
    const senderId = user.id; // Securely get senderId from authenticated user

    // Securely find receiver based on order participants
    const order = await prismaClient.order.findUnique({
      where: { id: orderId }
    });

    if (!order || (order.userId !== senderId && order.driverId !== senderId)) {
       socket.emit('chat:error', { message: 'Unauthorized' });
       return;
    }

    // Determine receiver (the other participant)
    const receiverId = order.userId === senderId ? order.driverId : order.userId;

    if (!receiverId) {
       socket.emit('chat:error', { message: 'No receiver found' });
       return;
    }

    // Save message to database
    const message = await prismaClient.message.create({
      data: {
        orderId,
        senderId,
        receiverId,
        content,
      },
    });

    // Broadcast message to chat room
    io.to(`chat:${orderId}`).emit('chat:message', {
      id: message.id,
      orderId,
      senderId,
      receiverId,
      content,
      createdAt: message.createdAt,
      read: false,
    });

    if (process.env.NODE_ENV !== 'test') console.log(`Message sent in order ${orderId} from ${senderId}`);
  } catch (error) {
    console.error('Error sending chat message:', error);
    socket.emit('chat:error', { message: 'Failed to send message' });
  }
};
