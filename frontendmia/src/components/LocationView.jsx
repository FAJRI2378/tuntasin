import React, { useState, useEffect } from "react";
import styles from "../css/pages/AdminSubmission.module.css";

export default function LocationView({ locationString, size }) {
  const [address, setAddress] = useState(locationString);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cek apakah string lokasi berupa koordinat (mengandung angka dan koma)
    // Contoh format koordinat: "-6.1481495,106.862797"
    const isCoordinate = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(
      locationString,
    );

    if (isCoordinate) {
      const [lat, lon] = locationString.split(",").map((s) => s.trim());
      fetchAddressName(lat, lon);
    } else {
      setAddress(locationString); // Jika sudah berupa nama jalan, langsung pakai
    }
  }, [locationString]);

  const fetchAddressName = async (lat, lon) => {
    try {
      setLoading(true);
      // Menggunakan OpenStreetMap Nominatim API (Gratis & Tanpa API Key)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "id", // Meminta hasil dalam Bahasa Indonesia
            "User-Agent": "TuntasinAdminApp/1.0", // Nominatim mewajibkan User-Agent unik
          },
        },
      );
      const data = await response.json();

      if (data && data.display_name) {
        // Ambil bagian terpenting saja (misal: Nama Jalan / Kelurahan / Kota) supaya tidak terlalu panjang
        const road = data.address?.road || data.address?.suburb || "";
        const city =
          data.address?.city ||
          data.address?.regency ||
          data.address?.county ||
          "";

        const shortAddress =
          road && city ? `${road}, ${city}` : data.display_name;
        setAddress(shortAddress);
      }
    } catch (error) {
      console.error("Gagal mengambil nama jalan:", error);
      setAddress(locationString); // Fallback ke koordinat asli jika gagal
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className={styles.locationText} style={{ 
      fontSize: size
     }}>
      {loading ? "Memuat lokasi..." : address}
    </span>
  );
}
