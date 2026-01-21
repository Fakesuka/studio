'use client';

import { useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

declare const DG: any;

export interface MapMarker {
  id: string;
  coords: [number, number];
  popup?: string | HTMLElement;
  icon?: any; // 2GIS icon options
}

interface Map2GISProps {
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  className?: string;
}

const areEqual = (prevProps: Map2GISProps, nextProps: Map2GISProps) => {
  return (
    prevProps.zoom === nextProps.zoom &&
    prevProps.center[0] === nextProps.center[0] &&
    prevProps.center[1] === nextProps.center[1] &&
    JSON.stringify(prevProps.markers) === JSON.stringify(nextProps.markers)
  );
};

const Map2GIS: React.FC<Map2GISProps> = ({
  center,
  zoom,
  markers = [],
  className,
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (typeof DG === 'undefined') {
      console.error('2GIS API not loaded');
      return;
    }

    let isMounted = true;
    let map: any;

    const intervalId = setInterval(() => {
      if (typeof DG !== 'undefined' && DG.map) {
        clearInterval(intervalId);
        if (!isMounted || !mapContainerRef.current) return;

        map = DG.map(mapContainerRef.current, {
          center: center,
          zoom: zoom,
          fullscreenControl: false,
          zoomControl: false,
        });
        mapRef.current = map;

        // Initial markers
        markers.forEach(markerInfo => {
          const marker = DG.marker(markerInfo.coords).addTo(map);
          if (markerInfo.popup) {
            marker.bindPopup(markerInfo.popup);
          }
          markersRef.current.set(markerInfo.id, marker);
        });
      }
    }, 100);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (map) {
        map.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Update center
    map.setCenter(center);
    
    const newMarkerIds = new Set(markers.map(m => m.id));

    // Remove old markers
    markersRef.current.forEach((markerInstance, id) => {
      if (!newMarkerIds.has(id)) {
        markerInstance.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach(markerInfo => {
      const existingMarker = markersRef.current.get(markerInfo.id);
      if (existingMarker) {
        existingMarker.setLatLng(markerInfo.coords);
      } else {
        const newMarker = DG.marker(markerInfo.coords).addTo(map);
        if (markerInfo.popup) {
          newMarker.bindPopup(markerInfo.popup);
        }
        markersRef.current.set(markerInfo.id, newMarker);
      }
    });

    // Fit bounds if more than one marker
    if (markers.length > 1) {
      const markerBounds = DG.latLngBounds(markers.map(m => m.coords));
      map.fitBounds(markerBounds, { padding: [50, 50] });
    } else if (markers.length === 1) {
      map.setView(markers[0].coords, zoom);
    }
  }, [center, zoom, markers]);

  return <div ref={mapContainerRef} className={cn('h-full w-full', className)} />;
};

export default memo(Map2GIS, areEqual);
