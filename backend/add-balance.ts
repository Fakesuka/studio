import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBalanceToUser() {
  try {
    // Ищем пользователя по имени или telegramId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'pllotnikvv', mode: 'insensitive' } },
          { telegramId: 'pllotnikvv' }
        ]
      }
    });

    if (!user) {
      console.log('Пользователь pllotnikvv не найден');
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
        balance: user.balance + 10000
      }
    });

    // Создаем запись о транзакции
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'topup',
        amount: 10000,
        description: 'Пополнение баланса администратором'
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
