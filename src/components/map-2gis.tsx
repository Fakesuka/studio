'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// This is to inform TypeScript about the global DG object from the 2GIS script.
declare const DG: any;

interface Map2GISProps {
  center: [number, number];
  zoom: number;
  className?: string;
}

const Map2GIS: React.FC<Map2GISProps> = ({ center, zoom, className }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const isMapInitialized = useRef(false);

  useEffect(() => {
    if (isMapInitialized.current) return;

    const initMap = () => {
      if (mapRef.current && typeof DG !== 'undefined' && !isMapInitialized.current) {
        const map = DG.map(mapRef.current, {
          center: center,
          zoom: zoom,
          fullscreenControl: false,
          zoomControl: false,
        });

        DG.marker(center).addTo(map);
        isMapInitialized.current = true;
      }
    };

    // Check if script is already present
    if (document.querySelector('script[src*="2gis"]')) {
       if (typeof DG !== 'undefined') {
         DG.then(initMap);
       }
       return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
    script.async = true;
    script.onload = () => {
      DG.then(initMap);
    };
    document.head.appendChild(script);
    
  }, [center, zoom]);

  return <div ref={mapRef} className={cn('w-full h-full', className)} />;
};

export default Map2GIS;
