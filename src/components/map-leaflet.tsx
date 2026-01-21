'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import type { Map } from 'leaflet';

export interface MapMarker {
  id: string;
  coords: LatLngExpression;
  label?: string;
  popup?: React.ReactNode;
}

interface MapLeafletProps {
  center: LatLngExpression;
  zoom: number;
  markers?: MapMarker[];
  className?: string;
}

const BoundsFitter = ({ markers }: { markers: MapMarker[] }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 1) {
      const bounds = markers.map(m => m.coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (markers.length === 1) {
      map.setView(markers[0].coords, map.getZoom());
    }
  }, [markers, map]);
  return null;
};

const MapLeaflet: React.FC<MapLeafletProps> = ({
  center,
  zoom,
  markers = [],
  className,
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className={cn('h-full w-full', className)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map(marker => (
        <Marker key={marker.id} position={marker.coords}>
          {marker.popup && <Popup>{marker.popup}</Popup>}
        </Marker>
      ))}
      <BoundsFitter markers={markers} />
    </MapContainer>
  );
};

export default MapLeaflet;
