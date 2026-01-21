'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Snowflake } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock weather data for Yakutsk
const MOCK_WEATHER = {
  city: 'Якутск',
  temperature: -32, // Let's make it cold to show the warning
};

const COLD_WEATHER_THRESHOLD = -25;

export function WeatherWidget() {
  const [weather, setWeather] = useState<{
    city: string;
    temperature: number;
  } | null>(null);

  useEffect(() => {
    // In a real app, you would fetch this data from a weather API.
    // For now, we use mock data and set it on the client to avoid hydration issues.
    setWeather(MOCK_WEATHER);
  }, []);

  const isCold = weather && weather.temperature <= COLD_WEATHER_THRESHOLD;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Погода</CardTitle>
        <Snowflake className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {weather ? (
          <>
            <div className="text-2xl font-bold">{weather.temperature}°C</div>
            <p className="text-xs text-muted-foreground">{weather.city}</p>
            {isCold && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Сильный мороз!</AlertTitle>
                <AlertDescription>
                  Риск не завести автомобиль. Не забудьте включить автозапуск.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
