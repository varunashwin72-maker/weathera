import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { WeatherCurrent } from "../types";

interface WeatherMapProps {
  current: WeatherCurrent;
}

function MapCenterer({ current }: WeatherMapProps) {
  const map = useMap();

  useEffect(() => {
    map.setView([current.lat, current.lon], 8);
  }, [map, current.lat, current.lon]);

  return null;
}

export function WeatherMap({ current }: WeatherMapProps) {
  const markerIcon = L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:#38bdf8;box-shadow:0 0 24px rgba(56,189,248,0.65);"></div>`,
    iconSize: [18, 18],
    className: "",
  });

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Live regional map</h4>
          <p className="text-sm text-slate-400">Dynamically centered around {current.city}</p>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">Map</span>
      </div>
      <div className="h-[280px] overflow-hidden rounded-2xl border border-white/10">
        <MapContainer center={[current.lat, current.lon]} zoom={8} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapCenterer current={current} />
          <Marker position={[current.lat, current.lon]} icon={markerIcon}>
            <Popup>{current.city}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
