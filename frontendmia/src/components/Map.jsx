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
import Swal from "sweetalert2";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function ChangeMapCenter({ center }) {
  const map = useMap();
  map.flyTo(center, 14);
  return null;
}

export default function MapLocation({
  onLocationSelect,
  height = "200px",
}) {
  const [userPosition, setUserPosition] = useState([-6.175389, 106.827139]);
  const [loading, setLoading] = useState(false);

  function LocationMarker({ onLocationSelect }) {
    useMapEvents({
      click(e) {
        setUserPosition(e.latlng);

        if (onLocationSelect) {
          onLocationSelect(`${e.latlng.lat}, ${e.latlng.lng}`);
        }
      },
    });

    return userPosition === null ? null : (
      <Marker position={userPosition}></Marker>
    );
  }

  useEffect(() => {
    function getCurrentLocation() {
      if (!navigator.geolocation) {
        Swal.fire({
          icon: "error",
          title: "Upss",
          text: "Browser kamu tidak mendukung Geolocation.",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserPosition([lat, lng]);
        },
        (error) => {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Upss",
            text: "Gagal mendapatkan lokasi. Pastikan GPS diizinkan di browser yaa!",
          });
        },
        { enableHighAccuracy: true },
      );
    }
    getCurrentLocation();
  });

  return (
    <MapContainer
      center={userPosition}
      zoom={13}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {loading ? "Loading..." : ""}

      <LocationMarker onLocationSelect={onLocationSelect} />

      <ChangeMapCenter center={userPosition} />
    </MapContainer>
  );
}
