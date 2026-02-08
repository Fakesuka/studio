import { handleChatSend } from '../socket/chat';

// Mock objects
const mockIo = {
  to: (room: string) => ({
    emit: (event: string, payload: any) => {
      mockIo.lastEmit = { room, event, payload };
    }
  }),
  lastEmit: null as any
};

const mockSocket = {
  emit: (event: string, payload: any) => {
    mockSocket.lastEmit = { event, payload };
  },
  lastEmit: null as any
} as any;

const mockUser = {
  id: 'authenticated-user-id'
};

const mockPrisma = {
  order: {
    findUnique: async (args: any) => {
      if (args.where.id === 'order-success') {
        return {
          id: 'order-success',
          userId: 'authenticated-user-id',
          driverId: 'other-user-id'
        };
      }
      return null;
    }
  },
  message: {
    create: async (args: any) => {
      mockPrisma.lastCreate = args;
      return {
        id: 'msg-id',
        createdAt: new Date(),
        ...args.data
      };
    }
  },
  lastCreate: null as any
};

async function runTest() {
  console.log('--- Test Case: Verify impersonation prevention in handleChatSend ---');

  // Attempt to spoof senderId
  const maliciousPayload = {
    orderId: 'order-success',
    content: 'Hello from attacker',
    senderId: 'attacker-id', // Trying to impersonate
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
    maliciousPayload as any,
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

  if (mockPrisma.lastCreate.data.senderId !== 'authenticated-user-id') {
    console.error(`FAIL: senderId mismatch. Expected authenticated-user-id, got ${mockPrisma.lastCreate.data.senderId}`);
    process.exit(1);
  }

  console.log('PASS: senderId was correctly set to authenticated user ID, ignoring payload senderId');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
