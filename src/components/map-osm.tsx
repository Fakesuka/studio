'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import * as L from 'leaflet';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
  id: string;
  coords: [number, number];
  popup?: string | HTMLElement;
  icon?: L.Icon;
  iconUrl?: string;
  iconSize?: [number, number];
}

interface MapOSMProps {
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  routes?: [number, number][][];
  interactive?: boolean;
  onClick?: (coords: [number, number]) => void;
  className?: string;
  preserveZoom?: boolean;
}

const MapOSM: React.FC<MapOSMProps> = ({
  center,
  zoom,
  markers = [],
  routes = [],
  interactive = false,
  onClick,
  className,
  preserveZoom = false,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const routesRef = useRef<L.Polyline[]>([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      scrollWheelZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    });

    mapRef.current = map;
    map.setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const handleResize = () => {
      map.invalidateSize();
    };
    setTimeout(handleResize, 0);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !interactive || !onClick) return;

    const handleClick = (event: L.LeafletMouseEvent) => {
      onClick([event.latlng.lat, event.latlng.lng]);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [interactive, onClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentMarkerIds = Array.from(markersRef.current.keys());
    const newMarkerIds = markers.map((marker) => marker.id);

    currentMarkerIds.forEach((id) => {
      if (!newMarkerIds.includes(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    });

    markers.forEach((markerInfo) => {
      const existingMarker = markersRef.current.get(markerInfo.id);
      const icon = markerInfo.icon
        || (markerInfo.iconUrl
          ? L.icon({
              iconUrl: markerInfo.iconUrl,
              iconSize: markerInfo.iconSize || [32, 32],
              iconAnchor: [(markerInfo.iconSize?.[0] || 32) / 2, markerInfo.iconSize?.[1] || 32],
              popupAnchor: [0, -(markerInfo.iconSize?.[1] || 32)],
            })
          : DefaultIcon);

      if (existingMarker) {
        existingMarker.setLatLng(markerInfo.coords);
        existingMarker.setIcon(icon);
      } else {
        const newMarker = L.marker(markerInfo.coords, { icon }).addTo(map);
        if (markerInfo.popup) {
          newMarker.bindPopup(markerInfo.popup);
        }
        markersRef.current.set(markerInfo.id, newMarker);
      }
    });

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (markers.length > 1) {
      try {
        const bounds = L.latLngBounds(markers.map((marker) => marker.coords));
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error('Could not fit bounds:', error);
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

    routesRef.current.forEach((route) => route.remove());
    routesRef.current = [];

    routes.forEach((routeCoords) => {
      if (routeCoords.length < 2) return;
      const polyline = L.polyline(routeCoords, {
        color: '#facc15',
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
      routesRef.current.push(polyline);
    });
  }, [routes]);

  return <div ref={mapContainerRef} className={cn('h-full w-full', className)} />;
};

export default MapOSM;
