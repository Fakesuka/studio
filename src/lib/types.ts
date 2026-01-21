export type User = {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

export type OrderStatus = 'Ожидает' | 'В процессе' | 'Завершен' | 'Отменен';

export type ServiceType =
  | 'Отогрев авто'
  | 'Доставка топлива'
  | 'Техпомощь'
  | 'Эвакуатор';

export type Order = {
  id: string;
  service: ServiceType;
  date: string;
  status: OrderStatus;
  price: number;
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
  storeName: string;
  storeDescription: string;
};
