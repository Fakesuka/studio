import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBalanceToUser() {
  try {
    const targetName = 'Vasiliy';
    const amount = 5000;

    // Ищем пользователя по имени или telegramId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: targetName, mode: 'insensitive' } },
          { telegramId: targetName }
        ]
      }
    });

    if (!user) {
      console.log(`Пользователь ${targetName} не найден`);
      console.log('Доступные пользователи:');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          telegramId: true,
          balance: true
        }
      });
      console.table(allUsers);
      return;
    }

    console.log('Найден пользователь:', user);
    console.log('Текущий баланс:', user.balance);

    // Обновляем баланс
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: user.balance + amount
      }
    });

    // Создаем запись о транзакции
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'topup',
        amount,
        description: `Пополнение баланса администратором (${targetName})`
      }
    });

    console.log('Баланс успешно обновлен!');
    console.log('Новый баланс:', updatedUser.balance);
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBalanceToUser();
