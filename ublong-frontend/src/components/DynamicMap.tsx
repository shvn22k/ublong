"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

interface CountryData {
  name: string;
  coords: [number, number];
  code: string;
}

interface DynamicMapProps {
  countries: CountryData[];
  onSelectCountry: (code: string) => void;
  selectedCode?: string;
}

function MapUpdater({ selectedCoords }: { selectedCoords?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords) {
      map.setView(selectedCoords, 4, { animate: true });
    } else {
      map.setView([20, 0], 2, { animate: true });
    }
  }, [selectedCoords, map]);
  return null;
}

export default function DynamicMap({ countries, onSelectCountry, selectedCode }: DynamicMapProps) {
  const selectedCountry = countries.find(c => c.code === selectedCode);

  return (
    <div className="w-full h-full min-h-[420px] rounded-xl overflow-hidden relative z-0">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: "100%", height: "100%", minHeight: "420px" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater selectedCoords={selectedCountry?.coords} />
        
        {countries.map((country) => (
          <Marker 
            key={country.code} 
            position={country.coords}
            icon={customIcon}
            eventHandlers={{
              click: () => onSelectCountry(country.code),
            }}
          >
            <Popup>
              <div className="text-center font-bold text-slate-800">
                {country.name}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
