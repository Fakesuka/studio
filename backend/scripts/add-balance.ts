import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBalance(username: string, amount: number) {
  try {
    // Find user by name (contains search)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: username, mode: 'insensitive' } },
          { telegramId: username },
        ],
      },
    });

    if (!user) {
      console.error(`User "${username}" not found`);
      return;
    }

    console.log(`Found user: ${user.name} (ID: ${user.id})`);
    console.log(`Current balance: ${user.balance} ₽`);

    // Update balance
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'bonus',
        amount: amount,
        status: 'completed',
        description: `Начисление бонуса администратором`,
      },
    });

    console.log(`✅ Added ${amount} ₽ to ${user.name}`);
    console.log(`New balance: ${updated.balance} ₽`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get args
const username = process.argv[2];
const amount = parseFloat(process.argv[3]);

if (!username || !amount) {
  console.log('Usage: npx ts-node scripts/add-balance.ts <username> <amount>');
  console.log('Example: npx ts-node scripts/add-balance.ts pllotnikvv 10000');
  process.exit(1);
}

addBalance(username, amount);
