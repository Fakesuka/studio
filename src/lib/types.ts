export type User = {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export type ServiceType = 'Car Heating' | 'Fuel Delivery' | 'Tech Help' | 'Towing';

export type Order = {
  id: string;
  service: ServiceType;
  date: string;
  status: OrderStatus;
  price: number;
  provider?: ServiceProvider;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
};

export type ServiceProvider = {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  distance: number; // in km
  vehicle: string;
};
