import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
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

function LocationMarker() {
  const [position, setPosition] = useState(null);

  // Event handler peta
  useMapEvents({
    click(e) {
      console.log(e.latlng);
      setPosition(e.latlng); // Mengambil koordinat tempat yang diklik
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function MapLocation() {
  const [userPosition, setUserPosition] = useState([-6.1753924, 106.8271528]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Browser kamu tidakmendukung Geolocation.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log([lat, lng])
        setUserPosition([lat, lng]);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        alert(
          "Gagal mendapatkan lokasi. Pastikan izin GPS diizinkan di browser!",
        );
        setLoading(false);
      },
      { enableHighAccuracy: true },
    );
  }, []);

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

      <LocationMarker />
    </MapContainer>
  );
}
