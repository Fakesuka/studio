'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

declare const DG: any;

export interface MapMarker {
  id: string;
  coords: [number, number];
  popup?: string | HTMLElement;
  icon?: any;
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
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Effect for initializing the map
  useEffect(() => {
    let map: any;

    const initMap = () => {
      if (!mapContainerRef.current) return;
      try {
        map = DG.map(mapContainerRef.current, {
          center: center,
          zoom: zoom,
          fullscreenControl: false,
          zoomControl: false,
          dragging: false,
        });
        mapRef.current = map;
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
  }, []); // Run only once on mount

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
        const newMarker = DG.marker(markerInfo.coords).addTo(map);
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
      map.setView(markers[0].coords, zoom);
    } else {
      map.setView(center, zoom);
    }
  }, [markers, center, zoom]);

  return <div ref={mapContainerRef} className={cn('h-full w-full', className)} />;
};

export default Map2GIS;
