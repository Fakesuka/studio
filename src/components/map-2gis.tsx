'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

declare const DG: any;

export interface MapMarker {
  id: string;
  coords: [number, number];
  popup?: string | HTMLElement;
  icon?: any;
  iconUrl?: string;
  iconSize?: [number, number];
}

interface Map2GISProps {
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  routes?: [number, number][][];
  interactive?: boolean;
  onClick?: (coords: [number, number]) => void;
  className?: string;
  preserveZoom?: boolean;
}

const Map2GIS: React.FC<Map2GISProps> = ({
  center,
  zoom,
  markers = [],
  routes = [],
  interactive = false,
  onClick,
  className,
  preserveZoom = false,
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const routesRef = useRef<any[]>([]);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_2GIS_API_KEY
    || '1e0bb99c-b88d-4624-974a-63ab8c556c19';

  // Effect for initializing the map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof DG !== 'undefined' && DG.map) {
      setIsScriptReady(true);
      return;
    }
    if (!apiKey) return;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-2gis-loader="true"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptReady(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.api.2gis.ru/2.0/loader.js?pkg=full&key=${apiKey}`;
    script.async = true;
    script.dataset['2gisLoader'] = 'true';
    script.onload = () => setIsScriptReady(true);
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    let map: any;

    const initMap = () => {
      if (!mapContainerRef.current) return;
      try {
        map = DG.map(mapContainerRef.current, {
          center: center,
          zoom: zoom,
          fullscreenControl: false,
          zoomControl: interactive,
          dragging: interactive,
        });
        mapRef.current = map;

        if (interactive && onClick) {
          map.on('click', (event: any) => {
            const { lat, lng } = event.latlng;
            onClick([lat, lng]);
          });
        }
      } catch (e) {
        console.error('Error initializing 2GIS map:', e);
      }
    };

    const scriptCheckInterval = setInterval(() => {
      if (typeof DG !== 'undefined' && DG.map) {
        clearInterval(scriptCheckInterval);
        initMap();
      }
    }, 100);

    return () => {
      clearInterval(scriptCheckInterval);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScriptReady]); // Run when script is ready

  // Effect for updating markers and view
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentMarkerIds = Array.from(markersRef.current.keys());
    const newMarkerIds = markers.map(m => m.id);

    // Remove markers that are no longer in props
    currentMarkerIds.forEach(id => {
      if (!newMarkerIds.includes(id)) {
        markersRef.current.get(id).remove();
        markersRef.current.delete(id);
      }
    });

    // Add new markers or update existing ones
    markers.forEach(markerInfo => {
      const existingMarker = markersRef.current.get(markerInfo.id);
      if (existingMarker) {
        existingMarker.setLatLng(markerInfo.coords);
      } else {
        const markerOptions: any = {};

        // Use custom icon if provided
        if (markerInfo.iconUrl) {
          markerOptions.icon = DG.icon({
            iconUrl: markerInfo.iconUrl,
            iconSize: markerInfo.iconSize || [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          });
        }

        const newMarker = DG.marker(markerInfo.coords, markerOptions).addTo(map);
        if (markerInfo.popup) {
          newMarker.bindPopup(markerInfo.popup);
        }
        markersRef.current.set(markerInfo.id, newMarker);
      }
    });
    
    // Adjust map view
    if (markers.length > 1) {
        try {
            const markerBounds = DG.latLngBounds(markers.map(m => m.coords));
            map.fitBounds(markerBounds, { padding: [50, 50] });
        } catch(e) {
            console.error("Could not fit bounds: ", e);
        }
    } else if (markers.length === 1) {
      const currentZoom = preserveZoom ? map.getZoom() : zoom;
      map.setView(markers[0].coords, currentZoom);
    } else if (!preserveZoom) {
      map.setView(center, zoom);
    }
  }, [markers, center, zoom, preserveZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routesRef.current.forEach(route => route.remove());
    routesRef.current = [];

    routes.forEach(routeCoords => {
      if (routeCoords.length < 2) return;
      const polyline = DG.polyline(routeCoords, {
        color: '#facc15',
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
      routesRef.current.push(polyline);
    });
  }, [routes]);

  if (!apiKey) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-lg bg-slate-900 text-sm text-slate-200',
          className
        )}
      >
        Укажите ключ 2GIS для отображения карты.
      </div>
    );
  }

  return <div ref={mapContainerRef} className={cn('h-full w-full', className)} />;
};

export default Map2GIS;
