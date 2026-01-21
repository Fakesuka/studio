'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Snowflake, LocateFixed } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const COLD_WEATHER_THRESHOLD = -25;

type WeatherState = {
  status: 'loading' | 'success' | 'error' | 'idle';
  data: {
    city: string;
    temperature: number;
  } | null;
  error: string | null;
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherState>({
    status: 'idle',
    data: null,
    error: null,
  });

  const fetchWeather = () => {
    setWeather({ status: 'loading', data: null, error: null });

    if (!navigator.geolocation) {
      setWeather({
        status: 'error',
        data: null,
        error: 'Геолокация не поддерживается вашим браузером.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;

          // Fetch city name
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=ru&format=json`
          );
          if (!geoRes.ok) throw new Error('Не удалось получить название города.');
          const geoData = await geoRes.json();
          const city = geoData?.results?.[0]?.name || 'Неизвестный город';

          // Fetch weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`
          );
          if (!weatherRes.ok)
            throw new Error('Не удалось получить данные о температуре.');
          const weatherData = await weatherRes.json();
          const temperature = Math.round(weatherData.current.temperature_2m);

          setWeather({
            status: 'success',
            data: { city, temperature },
            error: null,
          });
        } catch (error) {
          console.error('Failed to fetch weather data', error);
          const errorMessage =
            'Не удалось загрузить погоду. Проверьте интернет-соединение и попробуйте снова.';
          setWeather({
            status: 'error',
            data: null,
            error: errorMessage,
          });
        }
      },
      error => {
        console.error('Geolocation error', error);
        let errorMessage = 'Не удалось определить ваше местоположение.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Вы запретили доступ к геолокации.';
        }
        setWeather({
          status: 'error',
          data: null,
          error: errorMessage,
        });
      }
    );
  };

  const isCold =
    weather.status === 'success' &&
    weather.data &&
    weather.data.temperature <= COLD_WEATHER_THRESHOLD;

  const isLoading = weather.status === 'loading';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Погода</CardTitle>
        <Snowflake className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="min-h-[124px]">
        {weather.status === 'idle' && (
          <div className="flex h-full flex-col items-center justify-center gap-2 pt-2">
            <LocateFixed className="h-6 w-6 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              Нажмите, чтобы получить данные о погоде.
            </p>
            <Button size="sm" onClick={fetchWeather}>
              Определить погоду
            </Button>
          </div>
        )}
        {weather.status === 'loading' && (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
        {weather.status === 'error' && (
          <div className="flex h-full flex-col items-center justify-center gap-2 pt-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="text-center text-sm text-destructive">
              {weather.error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchWeather}
              disabled={isLoading}
            >
              Попробовать снова
            </Button>
          </div>
        )}
        {weather.status === 'success' && weather.data && (
          <div className="pt-1">
            <div className="text-2xl font-bold">
              {weather.data.temperature}°C
            </div>
            <p className="text-xs text-muted-foreground">
              {weather.data.city}
            </p>
            {isCold && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Сильный мороз!</AlertTitle>
                <AlertDescription>
                  Риск не завести автомобиль. Не забудьте включить автозапуск.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
