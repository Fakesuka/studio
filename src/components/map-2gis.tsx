'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

declare const DG: any;

export interface MapMarker {
  id: string;
  coords: [number, number];
  label?: string;
  iconUrl?: string;
  iconSize?: [number, number];
}

interface Map2GISProps {
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  className?: string;
}

const Map2GIS: React.FC<Map2GISProps> = ({
  center,
  zoom,
  markers = [],
  className,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerInstances = useRef<Map<string, any>>(new Map());

  // Effect for initializing the map and handling the script
  useEffect(() => {
    let isMounted = true;
    const scriptId = '2gis-map-script';

    const initMap = () => {
      if (!isMounted || !mapRef.current || typeof DG === 'undefined') return;
      if (mapInstance.current) return; // Already initialized

      mapInstance.current = DG.map(mapRef.current, {
        center: center,
        zoom: zoom,
        fullscreenControl: false,
        zoomControl: false,
      });
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
      script.async = true;
      script.onload = () => {
        if (typeof DG !== 'undefined') {
          DG.then(initMap);
        }
      };
      document.head.appendChild(script);
    } else if (typeof DG !== 'undefined') {
      DG.then(initMap);
    }

    return () => {
      isMounted = false;
    };
  }, [center, zoom]);

  // Effect for updating markers
  useEffect(() => {
    if (!mapInstance.current) return;

    const currentMarkerIds = new Set(markers.map(m => m.id));
    const markerCoords: [number, number][] = [];

    // Add/Update markers
    markers.forEach(markerInfo => {
      markerCoords.push(markerInfo.coords);
      let dgMarker = markerInstances.current.get(markerInfo.id);

      if (dgMarker) {
        // Update existing marker's position
        dgMarker.setLatLng(markerInfo.coords);
      } else {
        // Create new marker
        const icon = markerInfo.iconUrl
          ? DG.icon({
              iconUrl: markerInfo.iconUrl,
              iconSize: markerInfo.iconSize || [38, 38],
            })
          : undefined;

        dgMarker = DG.marker(markerInfo.coords, { icon }).addTo(
          mapInstance.current
        );
        if (markerInfo.label) {
          dgMarker.bindLabel(markerInfo.label);
        }
        markerInstances.current.set(markerInfo.id, dgMarker);
      }
    });

    // Remove markers that are no longer in the markers prop
    markerInstances.current.forEach((markerInstance, id) => {
      if (!currentMarkerIds.has(id)) {
        markerInstance.removeFrom(mapInstance.current);
        markerInstances.current.delete(id);
      }
    });

    // Adjust map view to fit all markers
    if (markerCoords.length > 1) {
      mapInstance.current.fitBounds(markerCoords, {
        padding: [50, 50],
      });
    } else if (markerCoords.length === 1) {
      mapInstance.current.setView(markerCoords[0], zoom);
    }
  }, [markers, zoom]);

  return <div ref={mapRef} className={cn('h-full w-full', className)} />;
};

export default Map2GIS;
