import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../js/api.js";
import { Flame, MapPin, Tag } from "lucide-react";
import { useSubmission } from "../contexts/SubmissionContext.jsx";
import styles from "../css/pages/PriorityHeatmap.module.css"

export default function PriorityHeatmap() {
  const { submission, setSubmission } = useSubmission();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (submission.length == 0) {
      api
        .get("submissions")
        .then((res) => {
          setSubmission(res.data.data || []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, []);

  // Fungsi warna berdasarkan status atau jumlah vote
  const getHeatColor = (status, votes) => {
    if (status === "pending") return "#f59e0b"; // Kuning/Orange
    if (status === "process") return "#3b82f6"; // Biru
    if (status === "invalid") return "#ef4444"; // Merah
    if (votes > 5) return "#dc2626"; // Merah Tua (Prioritas Tinggi)
    return "#10b981"; // Hijau (Selesai/Normal)
  };

  return (
    <div
      className={styles.container}
    >
      <div className={styles.contentTop}>

      <h2
        style={{ fontSize: "24px", marginBottom: "10px", fontWeight: "bold" }}
        >
        <Flame fill="#ffb937" color="#ef644e" /> Peta Panas & Prioritas Infrastruktur Indonesia (Priority Heatmap)
      </h2>
      <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "20px" }}>
        Visualisasi sebaran laporan infrastruktur di wilayah Indonesia
        berdasarkan tingkat urgensi dan akumulasi dukungan suara (vote).
      </p>
      </div>

      <div
        className={styles.contentBottom}
      >
        <div
          style={{ height: "500px", borderRadius: "8px", overflow: "hidden" }}
        >
          <MapContainer
            center={[-2.548926, 118.0148634]} // Titik tengah/pusat negara Indonesia
            zoom={5} // Zoom level pas untuk melihat seluruh kepulauan Indonesia
            style={{ height: "100%", width: "100%" }}
            maxBounds={[
              [6.0, 95.0], // Batas sudut barat laut Indonesia
              [-11.0, 141.0], // Batas sudut tenggara Indonesia
            ]}
            minZoom={4}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {submission.length > 0 &&
              submission.map((item) => {
                const parts = item.location.replace(" ", "").split(",");
                const coorObject = [
                  parseFloat(parts[0].trim()),
                  parseFloat(parts[1].trim()),
                ];

                const votes = item.votes_count || 0;
                const radiusSize = Math.min(10 + votes * 4, 35);

                return (
                  <CircleMarker
                    key={item.id}
                    center={coorObject}
                    radius={radiusSize}
                    pathOptions={{
                      color: getHeatColor(item.status, votes),
                      fillColor: getHeatColor(item.status, votes),
                      fillOpacity: 0.6,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div style={{ color: "#0f172a", minWidth: "180px" }}>
                        <strong
                          style={{
                            fontSize: "1rem",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {item.label}
                        </strong>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            margin: "0 0 6px 0",
                            color: "#334155",
                          }}
                        >
                          {item.description}
                        </p>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <span>📍 {item.location}</span>
                          <span
                            style={{ color: "#ef4444", fontWeight: "bold" }}
                          >
                            🔥 {votes} Dukungan (Vote)
                          </span>
                          <span
                            style={{
                              textTransform: "uppercase",
                              fontWeight: "bold",
                              color: "#2563eb",
                            }}
                          >
                            Status: {item.status}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
