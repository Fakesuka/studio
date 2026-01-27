import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserBalance() {
  console.log('💰 Updating balance for user pllotnikvv...');

  try {
    // Find user by username or name
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'pllotnikvv', mode: 'insensitive' } },
          { phone: { contains: 'pllotnikvv', mode: 'insensitive' } },
          { telegramId: { contains: 'pllotnikvv', mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      console.log('❌ User pllotnikvv not found. Listing all users...');

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
      console.log('\n⚠️  User pllotnikvv not found in database');
      return;
    }

    // Add 10000 to current balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: 10000 } },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'topup',
        amount: 10000,
        description: 'Пополнение баланса администратором',
      },
    });

    console.log(`✅ Updated balance for ${user.name} (ID: ${user.id})`);
    console.log(`   Old balance: ${user.balance.toFixed(2)} RUB`);
    console.log(`   New balance: ${updatedUser.balance.toFixed(2)} RUB`);
    console.log(`   Added: 10000 RUB`)

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
