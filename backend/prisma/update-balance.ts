import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserBalance() {
  const targetName = 'Vasiliy';
  const amount = 5000;
  console.log(`💰 Updating balance for user ${targetName}...`);

  try {
    // Find user by username or name
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: targetName, mode: 'insensitive' } },
          { phone: { contains: targetName, mode: 'insensitive' } },
          { telegramId: { contains: targetName, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      console.log(`❌ User ${targetName} not found. Listing all users...`);

      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          telegramId: true,
          balance: true,
        },
        take: 20,
      });

      console.log('\n📋 Available users:');
      console.table(allUsers);
      console.log(`\n⚠️  User ${targetName} not found in database`);
      return;
    }

    // Add amount to current balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: amount } },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'topup',
        amount,
        description: `Пополнение баланса администратором (${targetName})`,
      },
    });

    console.log(`✅ Updated balance for ${user.name} (ID: ${user.id})`);
    console.log(`   Old balance: ${user.balance.toFixed(2)} RUB`);
    console.log(`   New balance: ${updatedUser.balance.toFixed(2)} RUB`);
    console.log(`   Added: ${amount} RUB`);

  } catch (error) {
    console.error('❌ Error updating balance:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateUserBalance()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
