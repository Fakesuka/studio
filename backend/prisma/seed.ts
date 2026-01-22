import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.marketplaceOrderItem.deleteMany();
  await prisma.marketplaceOrder.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.order.deleteMany();
  await prisma.driverLocation.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  console.log('👤 Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      telegramId: '111111111',
      name: 'Администратор',
      phone: '+79142000001',
      isAdmin: true,
      balance: 10000,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      telegramId: '222222222',
      name: 'Иван Петров',
      phone: '+79142000002',
      balance: 5000,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      telegramId: '333333333',
      name: 'Мария Сидорова',
      phone: '+79142000003',
      balance: 3000,
    },
  });

  const driverUser1 = await prisma.user.create({
    data: {
      telegramId: '444444444',
      name: 'Алексей Водителев',
      phone: '+79142000004',
      balance: 2000,
    },
  });

  const driverUser2 = await prisma.user.create({
    data: {
      telegramId: '555555555',
      name: 'Сергей Автосервис',
      phone: '+79142000005',
      balance: 1500,
    },
  });

  const sellerUser1 = await prisma.user.create({
    data: {
      telegramId: '666666666',
      name: 'Магазин АвтоПлюс',
      phone: '+79142000006',
      balance: 50000,
    },
  });

  // Create driver profiles
  console.log('🚗 Creating driver profiles...');
  const driver1 = await prisma.driverProfile.create({
    data: {
      userId: driverUser1.id,
      name: 'Алексей Водителев',
      vehicle: 'Toyota Land Cruiser 200',
      services: ['Отогрев авто', 'Доставка топлива', 'Техпомощь'],
      legalStatus: 'Самозанятый',
      rating: 4.8,
      totalOrders: 127,
      verified: true,
      verifiedAt: new Date(),
    },
  });

  const driver2 = await prisma.driverProfile.create({
    data: {
      userId: driverUser2.id,
      name: 'Сергей Автосервис',
      vehicle: 'ГАЗель эвакуатор',
      services: ['Эвакуатор', 'Техпомощь'],
      legalStatus: 'ИП',
      rating: 5.0,
      totalOrders: 89,
      verified: false, // Unverified for testing
    },
  });

  // Create seller profiles
  console.log('🏪 Creating seller profiles...');
  const seller1 = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser1.id,
      type: 'store',
      storeName: 'АвтоПлюс',
      storeDescription: 'Автозапчасти и аксессуары для суровой зимы',
      address: 'ул. Ленина, 25, Якутск',
      workingHours: '09:00 - 20:00',
      verified: true,
      verifiedAt: new Date(),
    },
  });

  // Create demo shops
  console.log('🏬 Creating shops...');
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
      userId: sellerUser1.id,
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
      userId: sellerUser1.id,
    },
  });

  // Create demo products
  console.log('📦 Creating products...');
  const product1 = await prisma.product.create({
    data: {
      name: 'Провода для прикуривания',
      description: 'Профессиональные провода 3м, выдерживают -50°C',
      price: 1500,
      shopId: shop1.id,
      imageUrl: 'https://picsum.photos/seed/product1/200/200',
      imageHint: 'jumper cables',
      delivery: true,
      deliveryPrice: 200,
      approved: true,
      approvedAt: new Date(),
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Автомобильный компрессор',
      description: 'Компактный компрессор 12В для подкачки шин',
      price: 2500,
      shopId: shop1.id,
      imageUrl: 'https://picsum.photos/seed/product2/200/200',
      imageHint: 'car compressor',
      delivery: true,
      deliveryPrice: 200,
      approved: true,
      approvedAt: new Date(),
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Антифриз -50°C',
      description: 'Готовый антифриз, канистра 5л',
      price: 800,
      shopId: shop2.id,
      imageUrl: 'https://picsum.photos/seed/product3/200/200',
      imageHint: 'antifreeze',
      delivery: false,
      approved: true,
      approvedAt: new Date(),
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'Зимняя омывайка',
      description: 'Стеклоомыватель до -30°C, 4л',
      price: 300,
      shopId: shop2.id,
      imageUrl: 'https://picsum.photos/seed/product4/200/200',
      imageHint: 'windshield washer',
      delivery: false,
      approved: false, // Not approved for testing
    },
  });

  const product5 = await prisma.product.create({
    data: {
      name: 'Размораживатель замков',
      description: 'Спрей для размораживания замков и резинок',
      price: 250,
      shopId: shop2.id,
      imageUrl: 'https://picsum.photos/seed/product5/200/200',
      imageHint: 'lock de-icer',
      delivery: true,
      deliveryPrice: 150,
      approved: false, // Not approved for testing
    },
  });

  // Create demo orders
  console.log('📋 Creating service orders...');
  const order1 = await prisma.order.create({
    data: {
      orderId: 'SAHA-0001',
      userId: customer1.id,
      driverId: driverUser1.id,
      service: 'Отогрев авто',
      location: 'ул. Кирова, 12, Якутск',
      latitude: 62.0297,
      longitude: 129.7422,
      description: 'Машина замерзла около торгового центра',
      price: 1500,
      status: 'В процессе',
      arrivalTime: 15,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderId: 'SAHA-0002',
      userId: customer2.id,
      service: 'Доставка топлива',
      location: 'пр. Ленина, 45, Якутск',
      latitude: 62.0355,
      longitude: 129.7311,
      description: 'Закончился бензин на парковке',
      price: 2000,
      status: 'Ищет исполнителя',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderId: 'SAHA-0003',
      userId: customer1.id,
      driverId: driverUser2.id,
      service: 'Эвакуатор',
      location: 'ул. Октябрьская, 8, Якутск',
      latitude: 62.0234,
      longitude: 129.7189,
      description: 'Требуется эвакуация до автосервиса',
      price: 3500,
      status: 'Завершен',
    },
  });

  // Create driver locations
  console.log('📍 Creating driver locations...');
  await prisma.driverLocation.create({
    data: {
      driverId: driverUser1.id,
      latitude: 62.0285,
      longitude: 129.7400,
    },
  });

  // Create marketplace orders
  console.log('🛒 Creating marketplace orders...');
  const marketOrder1 = await prisma.marketplaceOrder.create({
    data: {
      orderId: 'MARKET-0001',
      userId: customer1.id,
      status: 'Доставляется',
      total: 1700,
      customerName: 'Иван Петров',
      customerPhone: '+79142000002',
      customerAddress: 'ул. Автодорожная, 15, кв. 42, Якутск',
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            price: 1500,
          },
        ],
      },
    },
  });

  const marketOrder2 = await prisma.marketplaceOrder.create({
    data: {
      orderId: 'MARKET-0002',
      userId: customer2.id,
      status: 'Новый',
      total: 3100,
      customerName: 'Мария Сидорова',
      customerPhone: '+79142000003',
      customerAddress: 'пр. Ленина, 78, кв. 15, Якутск',
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 1,
            price: 2500,
          },
          {
            productId: product3.id,
            quantity: 1,
            price: 800,
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👤 Users: ${await prisma.user.count()}`);
  console.log(`   🚗 Drivers: ${await prisma.driverProfile.count()}`);
  console.log(`   🏪 Sellers: ${await prisma.sellerProfile.count()}`);
  console.log(`   🏬 Shops: ${await prisma.shop.count()}`);
  console.log(`   📦 Products: ${await prisma.product.count()}`);
  console.log(`   📋 Service Orders: ${await prisma.order.count()}`);
  console.log(`   🛒 Marketplace Orders: ${await prisma.marketplaceOrder.count()}`);
  console.log('\n🔑 Test Credentials:');
  console.log(`   Admin: telegramId = ${adminUser.telegramId}`);
  console.log(`   Customer: telegramId = ${customer1.telegramId}`);
  console.log(`   Driver: telegramId = ${driverUser1.telegramId}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
