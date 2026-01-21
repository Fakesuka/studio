import {
  Car,
  Siren,
  MapPin,
  Star,
  Clock,
  Fuel,
  Wrench,
  Truck,
  Flame,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockOrders, mockProviders } from '@/lib/data';
import type { Order, ServiceProvider, ServiceType } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';

function getServiceIcon(serviceType: ServiceType) {
  switch (serviceType) {
    case 'Car Heating':
      return <Flame className="h-4 w-4 text-muted-foreground" />;
    case 'Fuel Delivery':
      return <Fuel className="h-4 w-4 text-muted-foreground" />;
    case 'Tech Help':
      return <Wrench className="h-4 w-4 text-muted-foreground" />;
    case 'Towing':
      return <Truck className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Car className="h-4 w-4 text-muted-foreground" />;
  }
}

function ActiveOrderCard({ order }: { order: Order }) {
  const mapPlaceholder = PlaceHolderImages.find(p => p.id === 'map-placeholder');

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Active Order: {order.id}</CardTitle>
        <CardDescription>
          {order.service} - Status: <Badge>{order.status}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {order.provider && (
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-14 w-14 sm:flex">
              <AvatarImage src={order.provider.avatarUrl} alt="Provider" />
              <AvatarFallback>
                {order.provider.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {order.provider.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.provider.vehicle}
              </p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{order.provider.rating}</span>
              </div>
            </div>
          </div>
        )}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          {mapPlaceholder && (
            <Image
              src={mapPlaceholder.imageUrl}
              alt={mapPlaceholder.description}
              fill
              className="object-cover"
              data-ai-hint={mapPlaceholder.imageHint}
            />
          )}
           <div className="absolute bottom-4 right-4 rounded-lg bg-primary/90 p-2 text-primary-foreground shadow-lg">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-bold">ETA: 8 mins</span>
                </div>
           </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Order Details</Button>
      </CardFooter>
    </Card>
  );
}

function ProviderCard({ provider }: { provider: ServiceProvider }) {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="hidden h-10 w-10 sm:flex">
        <AvatarImage src={provider.avatarUrl} alt="Provider" />
        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 gap-1">
        <p className="text-sm font-medium leading-none">{provider.name}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-3 w-3" />
          {provider.distance} km away
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        {provider.rating}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const activeOrder = mockOrders.find(o => o.status === 'In Progress');

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <div className="col-span-1 flex flex-col gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get help on the road quickly and easily.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/services/new" className="w-full">
              <Button size="lg" className="w-full h-full flex flex-col py-4 gap-2">
                <Wrench className="h-8 w-8" />
                <span className="text-base">Request Service</span>
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="lg"
              className="w-full h-full flex flex-col py-4 gap-2"
            >
              <Siren className="h-8 w-8" />
              <span className="text-base">Emergency Call</span>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nearby Providers</CardTitle>
            <CardDescription>
              Available specialists in your area.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {mockProviders.map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </CardContent>
        </Card>
      </div>

      {activeOrder ? (
        <ActiveOrderCard order={activeOrder} />
      ) : (
        <Card className="col-span-1 flex flex-col items-center justify-center text-center lg:col-span-2">
            <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Car className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle>All Clear!</CardTitle>
                <CardDescription>You have no active orders. Your road is clear.</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/services/new">
                    <Button>Create a New Request</Button>
                </Link>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
