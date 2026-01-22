import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo shops
  const shop1 = await prisma.shop.create({
    data: {
      name: 'АвтоМаркет Якутск',
      description: 'Автозапчасти и аксессуары',
      type: 'store',
      address: 'ул. Ленина, 1, Якутск',
      workingHours: '09:00 - 21:00',
      imageUrl: 'https://picsum.photos/seed/shop1/200/200',
      imageHint: 'auto parts store',
      bannerUrl: 'https://picsum.photos/seed/shop1-banner/800/200',
      bannerHint: 'auto parts banner',
    },
  });

  const shop2 = await prisma.shop.create({
    data: {
      name: 'Зимний Драйв',
      description: 'Товары для зимнего вождения',
      type: 'store',
      address: 'пр. Ленина, 15, Якутск',
      workingHours: '10:00 - 20:00',
      imageUrl: 'https://picsum.photos/seed/shop2/200/200',
      imageHint: 'winter driving store',
      bannerUrl: 'https://picsum.photos/seed/shop2-banner/800/200',
      bannerHint: 'winter driving banner',
    },
  });

  // Create demo products
  await prisma.product.createMany({
    data: [
      {
        name: 'Провода для прикуривания',
        description: 'Профессиональные провода 3м, выдерживают -50°C',
        price: 1500,
        shopId: shop1.id,
        imageUrl: 'https://picsum.photos/seed/product1/200/200',
        imageHint: 'jumper cables',
        delivery: true,
        deliveryPrice: 200,
      },
      {
        name: 'Автомобильный компрессор',
        description: 'Компактный компрессор 12В для подкачки шин',
        price: 2500,
        shopId: shop1.id,
        imageUrl: 'https://picsum.photos/seed/product2/200/200',
        imageHint: 'car compressor',
        delivery: true,
        deliveryPrice: 200,
      },
      {
        name: 'Антифриз -50°C',
        description: 'Готовый антифриз, канистра 5л',
        price: 800,
        shopId: shop2.id,
        imageUrl: 'https://picsum.photos/seed/product3/200/200',
        imageHint: 'antifreeze',
        delivery: false,
      },
      {
        name: 'Зимняя омывайка',
        description: 'Стеклоомыватель до -30°C, 4л',
        price: 300,
        shopId: shop2.id,
        imageUrl: 'https://picsum.photos/seed/product4/200/200',
        imageHint: 'windshield washer',
        delivery: false,
      },
      {
        name: 'Размораживатель замков',
        description: 'Спрей для размораживания замков и резинок',
        price: 250,
        shopId: shop2.id,
        imageUrl: 'https://picsum.photos/seed/product5/200/200',
        imageHint: 'lock de-icer',
        delivery: true,
        deliveryPrice: 150,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
