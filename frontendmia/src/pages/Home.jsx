import React, { useState, useEffect } from "react";
import api from "../js/api";
import { Flame, MapPin, User, Tag, Clock } from "lucide-react";

export default function Home() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      setLoading(true);
      const response = await api.get("submissions");
      setSubmissions(response.data.data || []);
    } catch (error) {
      console.error("Gagal memuat submission:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fungsi untuk menangani klik tombol Vote
  async function handleVote(submissionId) {
    try {
      await api.post(`submissions/${submissionId}/vote`);
      fetchSubmissions();
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Silakan login terlebih dahulu untuk memberikan dukungan (vote)!");
      } else {
        alert("Gagal memproses vote. Terjadi kesalahan server.");
      }
    }
  }

  // Helper untuk Warna dan Label Status
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { label: "Pending", bg: "#f59e0b" };
      case "process":
        return { label: "Diproses", bg: "#3b82f6" };
      case "invalid":
        return { label: "Invalid", bg: "#ef4444" };
      case "completed":
        return { label: "Selesai", bg: "#10b981" };
      default:
        return { label: status, bg: "#6b7280" };
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ color: "#3b82f6", fontSize: "1.2rem", fontWeight: "bold", animation: "pulse 1.5s infinite" }}>
          Memuat Laporan Warga...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", color: "#fff" }}>
      <div style={{ marginBottom: "30px", borderBottom: "1px solid #334155", paddingBottom: "15px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: "0 0 10px 0" }}>Laporan Terbaru & Paling Mendesak</h1>
        <p style={{ color: "#94a3b8", margin: 0 }}>
          Daftar laporan infrastruktur dari masyarakat. Laporan dengan dukungan (vote) terbanyak akan berada di urutan teratas untuk segera ditindaklanjuti.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {submissions.length > 0 ? (
          submissions.map((item, index) => {
            const statusInfo = getStatusBadge(item.status);
            return (
              <div 
                key={item.id} 
                style={{ 
                  backgroundColor: "#1e293b", 
                  borderRadius: "12px", 
                  border: index === 0 ? "2px solid #ef4444" : "1px solid #334155", 
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative"
                }}
              >
                {/* Badge Rank 1 & Status */}
                <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px", zIndex: 2 }}>
                  {index === 0 && (
                    <div style={{ backgroundColor: "#ef4444", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                      🔥 Prioritas Utama
                    </div>
                  )}
                  {/* Badge Status Laporan */}
                  <div style={{ backgroundColor: statusInfo.bg, color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                    {statusInfo.label}
                  </div>
                </div>

                {/* Foto Laporan (Jika ada) */}
                <div style={{ height: "180px", backgroundColor: "#0f172a", overflow: "hidden" }}>
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={`http://localhost:8000/storage/${item.images[0].url}`} 
                      alt="Laporan" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                      Tidak ada foto
                    </div>
                  )}
                </div>

                <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1.2rem", margin: "0 0 10px 0", color: "#f8fafc", lineHeight: "1.4" }}>
                    {item.label}
                  </h3>
                  
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "15px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>

                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={16} color="#ef4444" /> {item.location}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Tag size={16} color="#3b82f6" /> {item.category?.name || "Umum"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "5px", borderTop: "1px solid #334155", paddingTop: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <User size={16} /> {item.user?.username || item.user?.name || "Warga"}
                      </span>
                      <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={14} /> {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Vote */}
                  <button 
                    onClick={() => handleVote(item.id)}
                    style={{
                      marginTop: "15px",
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
                  >
                    <Flame size={20} color="#fca5a5" />
                    Dukung Laporan Ini ({item.votes_count || 0})
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px", color: "#94a3b8", backgroundColor: "#1e293b", borderRadius: "12px" }}>
            Belum ada laporan dari warga. Jadilah yang pertama melaporkan!
          </div>
        )}
      </div>
    </div>
  );
}