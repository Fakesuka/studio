import { handleChatSend } from '../socket/chat';

// Mock objects
const mockIo = {
  to: (room: string) => ({
    emit: (event: string, payload: any) => {
      // console.log(`[MockIO] Emitting ${event} to ${room}`);
      mockIo.lastEmit = { room, event, payload };
    }
  }),
  lastEmit: null as any
};

const mockSocket = {
  emit: (event: string, payload: any) => {
    console.log(`[MockSocket] Emitting ${event}:`, payload);
    mockSocket.lastEmit = { event, payload };
  },
  lastEmit: null as any
} as any;

const mockUser = {
  id: 'user-123'
};

const mockPrisma = {
  order: {
    findUnique: async (args: any) => {
      // console.log('[MockPrisma] findUnique order:', args);
      if (args.where.id === 'order-success') {
        return {
          id: 'order-success',
          userId: 'user-123',
          driverId: 'driver-456'
        };
      }
      return null;
    }
  },
  message: {
    create: async (args: any) => {
      // console.log('[MockPrisma] create message:', args);
      mockPrisma.lastCreate = args;
      return {
        id: 'msg-789',
        createdAt: new Date(),
        ...args.data
      };
    }
  },
  lastCreate: null as any
};

async function runTest() {
  console.log('--- Test Case: Verify senderId is not taken from payload ---');

  // Attempt to spoof senderId
  const maliciousPayload = {
    orderId: 'order-success',
    content: 'Hello World',
    senderId: 'attacker-id', // Trying to impersonate attacker-id (or victim)
    receiverId: 'victim-id'
  };

  // Reset mocks
  mockIo.lastEmit = null;
  mockSocket.lastEmit = null;
  mockPrisma.lastCreate = null;

  await handleChatSend(
    mockIo as any,
    mockSocket,
    mockUser,
    maliciousPayload as any, // Cast because typescript type doesn't include senderId
    mockPrisma
  );

  // Assertions
  if (!mockPrisma.lastCreate) {
    console.error('FAIL: Message was not created');
    process.exit(1);
  }

  if (mockPrisma.lastCreate.data.senderId === 'attacker-id') {
    console.error('FAIL: Vulnerability Explored! senderId was taken from payload');
    process.exit(1);
  }

  if (mockPrisma.lastCreate.data.senderId !== 'user-123') {
    console.error(`FAIL: senderId mismatch. Expected user-123, got ${mockPrisma.lastCreate.data.senderId}`);
    process.exit(1);
  }

  console.log('PASS: senderId was correctly set to authenticated user ID');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
