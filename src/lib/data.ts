import type { Order, Product, ServiceProvider } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const mockUser = {
  name: 'Ivan Petrov',
  email: 'ivan.p@example.com',
  phone: '+7 (914) 271-23-45',
  avatarUrl: 'https://picsum.photos/seed/user/100/100',
};

export const mockOrders: Order[] = [
  { id: 'SAHA-001', service: 'Car Heating', date: '2024-01-15', status: 'Completed', price: 2500 },
  { id: 'SAHA-002', service: 'Fuel Delivery', date: '2024-01-20', status: 'Completed', price: 1800 },
  { id: 'SAHA-003', service: 'Towing', date: '2024-02-01', status: 'Cancelled', price: 8000 },
  { id: 'SAHA-004', service: 'Tech Help', date: '2024-02-10', status: 'In Progress', price: 3500, provider: { id: 'prov-1', name: 'Alexey', avatarUrl: 'https://picsum.photos/seed/provider1/100/100', rating: 4.9, distance: 2, vehicle: 'Toyota Hilux' } },
  { id: 'SAHA-005', service: 'Car Heating', date: '2024-02-11', status: 'Pending', price: 3000 },
];

const findImage = (id: string) => PlaceHolderImages.find(p => p.id === id) || { imageUrl: '', imageHint: '' };

export const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Car Blanket', description: 'Insulated engine blanket to keep warmth.', price: 3500, ...findImage('product-blanket') },
  { id: 'prod-2', name: 'AGM Battery', description: 'High-performance battery for extreme cold.', price: 15000, ...findImage('product-battery') },
  { id: 'prod-3', name: 'Jumper Starter', description: 'Portable pack to jump-start your car.', price: 8500, ...findImage('product-jumper') },
  { id: 'prod-4', name: 'Diesel Anti-gel', description: 'Prevents diesel fuel from gelling in cold.', price: 1200, ...findImage('product-antifreeze') },
  { id: 'prod-5', name: 'Compact Shovel', description: 'Durable and lightweight snow shovel.', price: 2000, ...findImage('product-shovel') },
  { id: 'prod-6', name: 'Snow Chains', description: 'Tire chains for improved traction on ice.', price: 6000, ...findImage('product-chains') },
];

export const mockProviders: ServiceProvider[] = [
  { id: 'prov-1', name: 'Alexey', avatarUrl: findImage('provider-1').imageUrl, rating: 4.9, distance: 2.5, vehicle: 'Toyota Hilux' },
  { id: 'prov-2', name: 'Mikhail', avatarUrl: findImage('provider-2').imageUrl, rating: 4.8, distance: 4.1, vehicle: 'UAZ Patriot' },
  { id: 'prov-3', name: 'Semyon', avatarUrl: findImage('provider-3').imageUrl, rating: 4.7, distance: 7.8, vehicle: 'Mitsubishi L200' },
];
