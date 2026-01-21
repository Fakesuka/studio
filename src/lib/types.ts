export type User = {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

export type OrderStatus =
  | 'Ищет исполнителя'
  | 'В процессе'
  | 'Завершен'
  | 'Отменен';

export type ServiceType =
  | 'Отогрев авто'
  | 'Доставка топлива'
  | 'Техпомощь'
  | 'Эвакуатор';

export const serviceTypesList: ServiceType[] = [
  'Отогрев авто',
  'Доставка топлива',
  'Техпомощь',
  'Эвакуатор',
];

export type DriverProfile = {
  id: string;
  name: string;
  vehicle: string;
  services: ServiceType[];
  balance?: number;
};

export type Order = {
  id: string;
  userId: string;
  driverId?: string;
  service: ServiceType;
  location: string;
  description: string;
  photo?: string;
  price: number;
  date: string;
  status: OrderStatus;
  provider?: ServiceProvider;
  arrivalTime?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  shopId: string;
  delivery: boolean;
  deliveryPrice?: number;
  pickup: boolean;
};

export type CartItem = Product & {
  quantity: number;
};

export type ServiceProvider = {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  distance: number; // in km
  vehicle: string;
};

export type SellerProfile = {
  id: string;
  type: 'store' | 'person';
  storeName: string;
  storeDescription: string;
  address?: string;
  workingHours?: string;
  balance?: number;
};

export type Shop = {
  id: string;
  name: string;
  userId?: string;
  imageUrl: string;
  imageHint: string;
  bannerUrl: string;
  bannerHint: string;
  description: string;
  type: 'store' | 'person';
  address?: string;
  workingHours?: string;
};
