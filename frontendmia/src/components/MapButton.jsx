import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import L from 'leaflet';

export default function LocationModalButton({ data }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Inisialisasi peta Leaflet saat modal terbuka
  useEffect(() => {
    if (isModalOpen) {
      // Delay kecil untuk memastikan elemen div#map sudah dirender oleh DOM
      const timer = setTimeout(() => {
        const indonesiaBounds = [
          [-11.0, 95.0],
          [6.0, 141.0]
        ];

        

        const map = L.map('modal-map', {
          center: [-0.7893, 113.9213], // Titik tengah Indonesia
          zoom: 5,
          minZoom: 4,
          maxBounds: indonesiaBounds,
          maxBoundsViscosity: 1.0
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Contoh menambahkan marker berdasarkan lokasi (jika item memiliki koordinat lat/lng)
        console.log(data.location)
        L.marker([-6.2088, 106.8456]).addTo(map).bindPopup(data.location).openPopup();

      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  return (
    <div style={{ position: "relative", display: "inline-block", marginBottom: "12px" }}>
      {/* Tombol Ikon Lokasi */}
      <button
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "6px",
          borderRadius: "6px",
          transition: "background 0.2s",
        }}
        title="Klik untuk lihat peta"
      >
        <MapPin size={18} color="#ef4444" />
      </button>

      {/* Tooltip saat di-hover */}
      {showTooltip && !isModalOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "6px",
            backgroundColor: "#1e293b",
            color: "#cbd5e1",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.75rem",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          {data.location}
        </div>
      )}

      {/* Modal / Popup Peta */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "16px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "600px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Header Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ color: "#f8fafc", fontWeight: "bold", fontSize: "0.95rem" }}>
                📍 {data.location}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Container Peta Leaflet */}
            <div
              id="modal-map"
              style={{
                width: "100%",
                height: "350px",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}