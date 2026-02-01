'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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

// Component to handle map view updates
function MapController({
  center,
  zoom,
  markers,
  preserveZoom,
}: {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  preserveZoom: boolean;
}) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (markers.length > 1) {
      try {
        const bounds = L.latLngBounds(markers.map((m) => m.coords));
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.error('Could not fit bounds:', e);
      }
    } else if (markers.length === 1) {
      const currentZoom = preserveZoom ? map.getZoom() : zoom;
      map.setView(markers[0].coords, currentZoom);
    } else if (!preserveZoom) {
      map.setView(center, zoom);
    }
  }, [map, markers, center, zoom, preserveZoom]);

  return null;
}

// Component to handle map click events
function MapClickHandler({ onClick }: { onClick?: (coords: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
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
  // Create custom icons for markers with custom iconUrl
  const markerIcons = useMemo(() => {
    const icons: Record<string, L.Icon> = {};
    markers.forEach((marker) => {
      if (marker.iconUrl) {
        icons[marker.id] = L.icon({
          iconUrl: marker.iconUrl,
          iconSize: marker.iconSize || [32, 32],
          iconAnchor: [(marker.iconSize?.[0] || 32) / 2, marker.iconSize?.[1] || 32],
          popupAnchor: [0, -(marker.iconSize?.[1] || 32)],
        });
      }
    });
    return icons;
  }, [markers]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={cn('h-full w-full', className)}
      zoomControl={interactive}
      dragging={interactive}
      touchZoom={interactive}
      doubleClickZoom={interactive}
      scrollWheelZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        center={center}
        zoom={zoom}
        markers={markers}
        preserveZoom={preserveZoom}
      />

      {interactive && onClick && <MapClickHandler onClick={onClick} />}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.coords}
          icon={marker.icon || markerIcons[marker.id] || DefaultIcon}
        />
      ))}

      {routes.map((route, index) => (
        route.length >= 2 && (
          <Polyline
            key={index}
            positions={route}
            pathOptions={{
              color: '#facc15',
              weight: 4,
              opacity: 0.8,
            }}
          />
        )
      ))}
    </MapContainer>
  );
};

export default MapOSM;
