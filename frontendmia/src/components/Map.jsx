import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function ChangeMapCenter({ center }) {
  const map = useMap(); 
  map.panTo(center, map.getZoom());
  return null;
}

export default function MapLocation({ onLocationSelect, currentCord }) {
  const [userPosition, setUserPosition] = useState(currentCord);
  const [loading, setLoading] = useState(false);

  function LocationMarker({ onLocationSelect }) {
    const [position, setPosition] = useState(userPosition);

    // Event handler peta
    useMapEvents({
      click(e) {
        setPosition(e.latlng);

        if (onLocationSelect) {
          onLocationSelect(`${e.latlng.lat}, ${e.latlng.lng}`);
        }
      },
    });

    return position === null ? null : <Marker position={position}></Marker>;
  }

  useEffect(() => {
    setUserPosition(currentCord);
  }, [currentCord]);

  return (
    <MapContainer
      center={userPosition}
      zoom={13}
      style={{ height: "200px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {loading ? "Loading..." : ""}

      {/* Teruskan props ke LocationMarker */}
      <LocationMarker onLocationSelect={onLocationSelect} />

      <ChangeMapCenter center={userPosition} />
    </MapContainer>
  );
}
