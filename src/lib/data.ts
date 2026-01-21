import type { Order, Product, ServiceProvider } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const mockUser = {
  name: 'Иван Петров',
  email: 'ivan.p@example.com',
  phone: '+7 (914) 271-23-45',
  avatarUrl: 'https://picsum.photos/seed/user/100/100',
};

export const mockOrders: Order[] = [
  { id: 'SAHA-001', service: 'Отогрев авто', date: '2024-01-15', status: 'Завершен', price: 2500 },
  { id: 'SAHA-002', service: 'Доставка топлива', date: '2024-01-20', status: 'Завершен', price: 1800 },
  { id: 'SAHA-003', service: 'Эвакуатор', date: '2024-02-01', status: 'Отменен', price: 8000 },
  { id: 'SAHA-004', service: 'Техпомощь', date: '2024-02-10', status: 'В процессе', price: 3500, provider: { id: 'prov-1', name: 'Алексей', avatarUrl: 'https://picsum.photos/seed/provider1/100/100', rating: 4.9, distance: 2, vehicle: 'Toyota Hilux' } },
  { id: 'SAHA-005', service: 'Отогрев авто', date: '2024-02-11', status: 'Ожидает', price: 3000 },
];

const findImage = (id: string) => PlaceHolderImages.find(p => p.id === id) || { imageUrl: '', imageHint: '' };

export const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Автоодеяло', description: 'Утепленное одеяло для двигателя для сохранения тепла.', price: 3500, ...findImage('product-blanket') },
  { id: 'prod-2', name: 'AGM аккумулятор', description: 'Высокопроизводительный аккумулятор для сильных морозов.', price: 15000, ...findImage('product-battery') },
  { id: 'prod-3', name: 'Пусковое устройство', description: 'Портативное устройство для запуска автомобиля.', price: 8500, ...findImage('product-jumper') },
  { id: 'prod-4', name: 'Антигель для дизеля', description: 'Предотвращает застывание дизельного топлива на морозе.', price: 1200, ...findImage('product-antifreeze') },
  { id: 'prod-5', name: 'Компактная лопата', description: 'Прочная и легкая снеговая лопата.', price: 2000, ...findImage('product-shovel') },
  { id: 'prod-6', name: 'Цепи противоскольжения', description: 'Цепи на шины для улучшения сцепления на льду.', price: 6000, ...findImage('product-chains') },
];

export const mockProviders: ServiceProvider[] = [
  { id: 'prov-1', name: 'Алексей', avatarUrl: findImage('provider-1').imageUrl, rating: 4.9, distance: 2.5, vehicle: 'Toyota Hilux' },
  { id: 'prov-2', name: 'Михаил', avatarUrl: findImage('provider-2').imageUrl, rating: 4.8, distance: 4.1, vehicle: 'УАЗ Патриот' },
  { id: 'prov-3', name: 'Семен', avatarUrl: findImage('provider-3').imageUrl, rating: 4.7, distance: 7.8, vehicle: 'Mitsubishi L200' },
];
