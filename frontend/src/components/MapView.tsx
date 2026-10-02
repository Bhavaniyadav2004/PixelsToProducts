import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import { Incident } from "../types";
import { pretty, sevColor } from "../utils/format";

interface Props {
  incidents: Incident[];
  height?: number;
  zoom?: number;
  linkPrefix?: string;
}

export default function MapView({ incidents, height = 360, zoom = 13, linkPrefix }: Props) {
  const center: [number, number] = incidents.length
    ? [incidents.reduce((s, i) => s + i.latitude, 0) / incidents.length, incidents.reduce((s, i) => s + i.longitude, 0) / incidents.length]
    : [17.385, 78.4867];
  return (
    <div>
      <MapContainer center={center} zoom={zoom} style={{ height }} scrollWheelZoom={false} key={incidents.length + center.join()}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {incidents.map((i) => {
          const color = i.status === "RESOLVED" ? "#16a34a" : sevColor[i.severity];
          return (
            <CircleMarker key={i.id} center={[i.latitude, i.longitude]} radius={9} pathOptions={{ color: "#fff", weight: 2, fillColor: color, fillOpacity: 0.95 }}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{i.incident_code}</div>
                  <div>{pretty(i.issue_type)}</div>
                  <div>{i.severity} - {pretty(i.status)}</div>
                  {linkPrefix && <Link to={`${linkPrefix}/${i.id}`} className="text-indigo-600">Open</Link>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="mt-2 flex gap-4 text-xs text-slate-600">
        <span><b style={{ color: sevColor.CRITICAL }}>●</b> Critical</span>
        <span><b style={{ color: sevColor.HIGH }}>●</b> High</span>
        <span><b style={{ color: sevColor.MEDIUM }}>●</b> Medium</span>
        <span><b style={{ color: sevColor.LOW }}>●</b> Low</span>
        <span><b style={{ color: "#16a34a" }}>●</b> Resolved</span>
      </div>
    </div>
  );
}
