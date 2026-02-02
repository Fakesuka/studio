'use client';

import { Wrench, Flame, Fuel, Zap, MapPin, Navigation, Snowflake, CloudSun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FrostButton } from '@/components/ui/frost-button';
import { IceCard } from '@/components/ui/ice-card';
import type { MarketplaceOrderStatus, OrderStatus } from '@/lib/types';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUserId } from '@/lib/user-utils';
import { useState, useEffect } from 'react';

const WEATHER_PERMISSION_KEY = 'yakgo_weather_permission';

type WeatherData = {
  city: string;
  temperature: number;
} | null;

const getServiceStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Завершен':
      return 'secondary';
    case 'В процессе':
      return 'default';
    case 'Отменен':
      return 'destructive';
    case 'Ищет исполнителя':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getMarketplaceStatusVariant = (status: MarketplaceOrderStatus) => {
  switch (status) {
    case 'Завершен':
      return 'secondary';
    case 'Доставляется':
    case 'В обработке':
      return 'default';
    case 'Отменен':
      return 'destructive';
    case 'Новый':
      return 'outline';
    default:
      return 'secondary';
  }
};

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-[200px] w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { orders, marketplaceOrders, isContextLoading, activeClientOrder } = useAppContext();
  const userId = getCurrentUserId();
  const [radarBlips, setRadarBlips] = useState<{ id: number; top: string; left: string; size: string; delay: string; opacity: number; color: string }[]>([]);
  const [weather, setWeather] = useState<WeatherData>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Fetch weather with geolocation
  useEffect(() => {
    const fetchWeather = async () => {
      if (!navigator.geolocation) {
        setWeatherLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Get city name using reverse geocoding (Nominatim)
            let city = 'Ваш город';
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ru`
              );
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                // Try to get city name from address
                city = geoData?.address?.city ||
                       geoData?.address?.town ||
                       geoData?.address?.village ||
                       geoData?.address?.municipality ||
                       geoData?.address?.state ||
                       city;
              }
            } catch (e) {
              console.error('Geocoding error:', e);
            }

            // Get weather
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`
            );
            if (weatherRes.ok) {
              const weatherData = await weatherRes.json();
              const temperature = Math.round(weatherData.current.temperature_2m);
              setWeather({ city, temperature });
              localStorage.setItem(WEATHER_PERMISSION_KEY, 'true');
            }
          } catch (error) {
            console.error('Weather fetch error:', error);
          } finally {
            setWeatherLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setWeatherLoading(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    const generateBlips = () => {
      return Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        size: `${Math.random() * 6 + 4}px`,
        delay: `${Math.random() * 0.5}s`,
        opacity: Math.random() * 0.5 + 0.3,
        color: Math.random() > 0.85 ? 'bg-neon-orange text-neon-orange shadow-[0_0_15px_currentColor]' : (Math.random() > 0.8 ? 'bg-white text-white shadow-[0_0_10px_currentColor]' : 'bg-neon-cyan text-neon-cyan shadow-[0_0_10px_currentColor]'),
      }));
    };

    setRadarBlips(generateBlips());

    const interval = setInterval(() => {
      setRadarBlips(generateBlips());
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  const userOrders = (orders || [])
    .filter(order => order.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const userMarketplaceOrders = (marketplaceOrders || [])
    .filter(order => order.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isContextLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 relative pb-24">

      {/* Dynamic Background Ambiance */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 blur-[120px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 blur-[120px] rounded-full animate-pulse-glow delay-700" />
      </div>

      {/* Live Activity (Ice Pill) */}
      {activeClientOrder && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className="mx-auto max-w-md glass-ice-heavy rounded-full p-2 pr-4 animate-in slide-in-from-top-4 duration-500 hover:scale-[1.02] transition-transform cursor-pointer border-neon-cyan/30">
            <Link href="/orders" className="flex items-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-black/40 border border-neon-cyan/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                <Wrench className="h-5 w-5 text-neon-cyan animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-neon-cyan font-bold leading-none mb-0.5">Активная миссия</span>
                <span className="text-white font-medium text-sm truncate leading-none">{activeClientOrder.service}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <Navigation className="h-4 w-4 text-white" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Hero: Ice Command Hub */}
      <section className="relative w-full">
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Центр заявок
          </h1>
          <p className="text-blue-200/60 text-sm font-light tracking-wide flex items-center gap-2">
            {weatherLoading ? (
              <span className="animate-pulse">Определение погоды...</span>
            ) : weather ? (
              <>
                {weather.city} • <span className="text-neon-cyan">{weather.temperature > 0 ? '+' : ''}{weather.temperature}°C</span>
              </>
            ) : (
              <>Якутия • <span className="text-gray-400">Погода недоступна</span></>
            )}
          </p>
        </div>

        <IceCard className="h-[160px] w-full relative group overflow-hidden border-neon-cyan/20 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          {/* Atmospheric Background */}
          <div className="absolute inset-0 bg-[url('/images/map_bg.png')] bg-cover bg-center opacity-50 mix-blend-overlay group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Radar Target Blips */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {radarBlips.map((blip) => (
              <div
                key={blip.id}
                className={`absolute rounded-full shadow-[0_0_10px_currentColor] animate-radar-blip opacity-0 ${blip.color}`}
                style={{
                  top: blip.top,
                  left: blip.left,
                  width: blip.size,
                  height: blip.size,
                  animationDelay: blip.delay,
                }}
              />
            ))}
          </div>

          {/* Central Button */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] z-10 flex flex-col items-center justify-center">
            {/* Pulsing Radar Waves */}
            <div className="absolute flex items-center justify-center pointer-events-none">
              <div className="absolute w-[300px] h-[300px] rounded-full border border-neon-cyan/5 animate-[ping_4s_linear_infinite]" />
              <div className="absolute w-[220px] h-[220px] rounded-full border border-neon-cyan/10 animate-[ping_3s_linear_infinite]" />
              <div className="absolute w-[140px] h-[140px] rounded-full border border-neon-cyan/20 animate-[ping_2s_linear_infinite]" />
            </div>

            {/* Action Button */}
            <div className="relative flex flex-col items-center">
              <Link href="/services/new" className="relative group flex items-center justify-center">
                <div className="absolute inset-0 bg-neon-cyan/30 blur-2xl rounded-full group-hover:bg-neon-cyan/50 transition-all duration-500 animate-pulse" />
                <div className="relative h-16 w-16 rounded-full bg-black/60 backdrop-blur-xl border border-neon-cyan/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:scale-105 group-hover:border-neon-cyan group-hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] transition-all duration-300 z-20">
                  <Wrench className="h-7 w-7 text-neon-cyan drop-shadow-[0_0_15px_rgba(6,182,212,1)]" />
                </div>
              </Link>
              <h2 className="absolute top-full mt-3 text-sm font-bold text-white tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
                Новая Заявка
              </h2>
            </div>
          </div>
        </IceCard>
      </section>

      {/* Mission Log (Tabs) */}
      <section className="flex-1">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full bg-black/40 border border-white/10 p-1 h-14 rounded-2xl backdrop-blur-md grid grid-cols-2 gap-2">
            <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-500 font-medium transition-all">
              Активные
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-500 font-medium transition-all">
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6 space-y-4">
            {userOrders.length > 0 ? (
              userOrders.map(order => (
                <IceCard key={order.id} variant="default" className="p-4 group cursor-pointer hover:border-neon-cyan/40">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-neon-cyan shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]">
                        <Snowflake className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-neon-cyan transition-colors">{order.service}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <p className="text-xs text-gray-400 font-mono">{order.location}</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`bg-transparent border ${order.status === 'В процессе' ? 'border-neon-cyan text-neon-cyan' : 'border-white/20 text-gray-400'}`}>
                      {order.status}
                    </Badge>
                  </div>
                </IceCard>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 border border-white/5 border-dashed rounded-3xl bg-white/5/50">
                <Snowflake className="h-8 w-8 text-white/10 mb-3" />
                <span className="text-sm">Нет активных заявок.</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 border border-white/5 border-dashed rounded-3xl bg-white/5/50">
              <span className="text-sm">История пуста.</span>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div >
  );
}
