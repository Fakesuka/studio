import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserBalance() {
  console.log('💰 Updating balance for user pllotnikv...');

  try {
    // Find user by username or name
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'pllotnikv', mode: 'insensitive' } },
          { phone: { contains: 'pllotnikv', mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      console.log('❌ User pllotnikv not found. Creating new user...');

      // Create user with balance
      const newUser = await prisma.user.create({
        data: {
          telegramId: 'pllotnikv_id',
          name: 'pllotnikv',
          phone: '+79991234560',
          balance: 10000,
        },
      });

      console.log('✅ Created user pllotnikv with 10000 RUB balance');
      console.log('User ID:', newUser.id);
      return;
    }

    // Update balance to 10000
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { balance: 10000 },
    });

    console.log(`✅ Updated balance for ${user.name} (ID: ${user.id})`);
    console.log(`   Old balance: ${user.balance} RUB`);
    console.log(`   New balance: ${updatedUser.balance} RUB`);

    // If user has driver profile, update that balance too
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });

    if (driverProfile) {
      await prisma.driverProfile.update({
        where: { id: driverProfile.id },
        data: { balance: 10000 },
      });
      console.log('✅ Updated driver profile balance to 10000 RUB');
    }

    // If user has seller profile, update that balance too
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });

    if (sellerProfile) {
      await prisma.sellerProfile.update({
        where: { id: sellerProfile.id },
        data: { balance: 10000 },
      });
      console.log('✅ Updated seller profile balance to 10000 RUB');
    }

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
