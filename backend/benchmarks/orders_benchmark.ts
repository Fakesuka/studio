import { ConcurrencyQueue } from '../src/utils/queue';

// Mock Prisma and Notifications
const mockPrisma = {
  driverProfile: {
    findMany: async () => {
        // Simulate DB delay
        await new Promise(r => setTimeout(r, 50));
        // Return 100 drivers
        return Array.from({ length: 100 }, (_, i) => ({
            user: { telegramId: `user_${i}` }
        }));
    }
  }
};

const mockNotifyNewOrder = async (id: string, data: any) => {
    // Simulate Network delay for Telegram API
    await new Promise(r => setTimeout(r, 200));
};

// Original implementation simulation
async function originalControllerLogic() {
    const start = process.hrtime();

    // 1. DB Call
    const driversToNotify = await mockPrisma.driverProfile.findMany();

    // 2. Notifications
    await Promise.all(
      driversToNotify
        .map(driver => driver.user?.telegramId)
        .filter(Boolean)
        .map(telegramId =>
          mockNotifyNewOrder(telegramId!, {})
        )
    );

    const end = process.hrtime(start);
    const timeInMs = (end[0] * 1000 + end[1] / 1e6).toFixed(2);
    console.log(`Original Logic Response Time: ${timeInMs}ms`);
}

// Optimized implementation simulation
async function optimizedControllerLogic() {
    const start = process.hrtime();

    // 1. DB Call
    const driversToNotify = await mockPrisma.driverProfile.findMany();

    // 2. Notifications (Background Queue)
    const queue = new ConcurrencyQueue(10);

    driversToNotify
      .map(driver => driver.user?.telegramId)
      .filter(Boolean)
      .forEach(telegramId => {
        queue.add(() => mockNotifyNewOrder(telegramId!, {}));
      });

    // The response returns HERE
    const end = process.hrtime(start);
    const timeInMs = (end[0] * 1000 + end[1] / 1e6).toFixed(2);
    console.log(`Optimized Logic Response Time: ${timeInMs}ms`);

    // Wait for queue to drain for benchmark purposes
    // In real app, we don't wait.
    const drainStart = Date.now();
    while (queue.pendingCount > 0 || queue.active > 0) {
        await new Promise(r => setTimeout(r, 10));
    }
    const drainTime = Date.now() - drainStart;
    console.log(`Queue drained in ${drainTime}ms (Background Processing)`);
}

(async () => {
    console.log('--- Benchmarking ---');
    await originalControllerLogic();
    await optimizedControllerLogic();
})();
