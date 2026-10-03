import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";

interface Props {
  lat: number | null;
  lon: number | null;
  accuracy?: number | null;
  onChange: (lat: number, lon: number) => void;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

function Recenter({ lat, lon }: { lat: number | null; lon: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lon !== null) {
      map.invalidateSize();
      map.flyTo([lat, lon], Math.max(map.getZoom(), 17), { duration: 0.8 });
    }
  }, [lat, lon, map]);
  return null;
}

function ClickToSet({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({ click: (e) => onChange(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function LocationPicker({ lat, lon, accuracy, onChange }: Props) {
  const has = lat !== null && lon !== null;
  return (
    <div id="location-map">
    <MapContainer center={has ? [lat, lon] : DEFAULT_CENTER} zoom={has ? 16 : 12} style={{ height: 280 }} scrollWheelZoom>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter lat={lat} lon={lon} />
      <ClickToSet onChange={onChange} />
      {has && accuracy ? (
        <CircleMarker center={[lat, lon]} radius={Math.min(Math.max(accuracy / 2, 12), 60)} pathOptions={{ color: "#1e40af", weight: 1, fillOpacity: 0.12 }} />
      ) : null}
      {has && (
        <CircleMarker center={[lat, lon]} radius={11} pathOptions={{ color: "#fff", weight: 3, fillColor: "#dc2626", fillOpacity: 1 }}>
          <Tooltip permanent direction="top" offset={[0, -10]}>Issue location</Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
    </div>
  );
}
