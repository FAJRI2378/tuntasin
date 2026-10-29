import React, { useState, useEffect } from "react";
import api from "../js/api";
import styles from "../css/pages/Home.module.css";
import { Flame, MapPin, User, Tag, Clock } from "lucide-react";

export default function Home() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FILTER & SORTING ---
  const [selectedStatuses, setSelectedStatuses] = useState(["pending"]); // Default "pending"
  const [sortBy, setSortBy] = useState("latest"); // 'latest', 'oldest', 'most_voted'

  useEffect(() => {
    fetchSubmissions();

    // Listener agar halaman Home otomatis memperbarui data ketika ada laporan yang dihapus atau diubah
    window.addEventListener("submissionUpdated", fetchSubmissions);
    return () => {
      window.removeEventListener("submissionUpdated", fetchSubmissions);
    };
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

  // --- FUNGSI KLIK VOTE ---
  async function handleVote(submissionId, isOwnData) {
    if (isOwnData) {
      alert("Anda tidak bisa mendukung laporan Anda sendiri.");
      return;
    }

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

  // --- LOGIKA CHECKLIST STATUS ---
  const handleStatusCheckboxChange = (statusValue) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(statusValue)) {
        return prev.filter((s) => s !== statusValue);
      } else {
        return [...prev, statusValue];
      }
    });
  };

  // --- FILTER & SORTING DATA ---
  const filteredSubmissions = submissions
    .filter((item) => selectedStatuses.length === 0 || selectedStatuses.includes(item.status))
    .sort((a, b) => {
      if (sortBy === "most_voted") return (b.votes_count || 0) - (a.votes_count || 0);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at); // latest
    });

  // --- HELPER BADGE STATUS ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return { label: "Pending", bg: "#f59e0b" };
      case "process": return { label: "Diproses", bg: "#3b82f6" };
      case "invalid": return { label: "Invalid", bg: "#ef4444" };
      case "completed": return { label: "Selesai", bg: "#10b981" };
      default: return { label: status, bg: "#6b7280" };
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#f59e0b" },
    { value: "process", label: "Diproses", color: "#3b82f6" },
    { value: "invalid", label: "Invalid", color: "#ef4444" },
    { value: "completed", label: "Selesai", color: "#10b981" },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", color: "#fff" }}>
      
      {/* CSS Animasi Skeleton Loading */}
      <style>
        {`
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .skeleton-card {
            background-color: #1e293b;
            border-radius: 12px;
            height: 380px;
            animation: skeleton-pulse 1.5s infinite ease-in-out;
            border: 1px solid #334155;
          }
        `}
      </style>

      {/* --- HEADER --- */}
      <div style={{ marginBottom: "20px", borderBottom: "1px solid #334155", paddingBottom: "15px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0 0 10px 0" }}>
          Laporan Terbaru & Paling Mendesak
        </h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
          Daftar laporan infrastruktur dari masyarakat. Berikan vote agar laporan cepat ditindaklanjuti.
        </p>
      </div>

      {/* --- BARIS FILTER & SORTING --- */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "15px", marginBottom: "20px", backgroundColor: "#1e293b", padding: "15px", borderRadius: "8px", border: "1px solid #334155" }}>
        
        {/* Checklist Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Status:</span>
          {statusOptions.map((status) => (
            <label key={status.value} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", fontSize: "0.9rem" }}>
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status.value)}
                onChange={() => handleStatusCheckboxChange(status.value)}
                style={{ accentColor: status.color, cursor: "pointer", width: "16px", height: "16px" }}
              />
              <span style={{ color: status.color }}>{status.label}</span>
            </label>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.9rem" }}>Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "#fff",
              outline: "none",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            <option value="latest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="most_voted">Vote Paling Banyak</option>
          </select>
        </div>
      </div>

      {/* --- GRID KARTU LAPORAN --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "15px" }}>
        
        {loading ? (
          /* SKELETON LOADING */
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="skeleton-card"></div>
          ))
        ) : filteredSubmissions.length > 0 ? (
          /* KARTU DATA ASLI */
          filteredSubmissions.map((item, index) => {
            const statusInfo = getStatusBadge(item.status);
            
            const rawUser = localStorage.getItem("user");
            const parsedUser = rawUser ? JSON.parse(rawUser) : {};
            const currentUserId = parsedUser.id || parsedUser.user?.id;

            const isOwnData = item.user_id == currentUserId || item.user?.id == currentUserId;
            const hasVoted = item.has_voted || false; 

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "10px",
                  border: index === 0 && sortBy === "most_voted" ? "2px solid #ef4444" : "1px solid #334155",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {/* Badge Rank 1 & Status */}
                <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px", zIndex: 2 }}>
                  {index === 0 && sortBy === "most_voted" && (
                    <div style={{ backgroundColor: "#ef4444", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "bold" }}>
                      🔥 Prioritas
                    </div>
                  )}
                  <div style={{ backgroundColor: statusInfo.bg, color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "bold" }}>
                    {statusInfo.label}
                  </div>
                </div>

                

                {/* Foto Laporan */}
                <div style={{ height: "140px", backgroundColor: "#0f172a", overflow: "hidden" }}>
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={`http://localhost:8000/storage/${item.images[0].url}`}
                      alt="Laporan"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "0.85rem" }}>
                      Tidak ada foto
                    </div>
                  )}
                </div>

                <div style={{ padding: "15px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: "0 0 8px 0", color: "#f8fafc", lineHeight: "1.3" }}>
                    {item.label}
                  </h3>

                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>

                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem", color: "#cbd5e1" }}>
                    
                    {/* Embedded Map Locator Kecil */}
                    <div style={{ marginBottom: "5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                         <MapPin size={14} color="#ef4444" /> {item.location}
                      </div>
                      <iframe
                        title="Peta Lokasi"
                        width="100%"
                        height="80"
                        frameBorder="0"
                        style={{ border: 0, borderRadius: "6px", opacity: 0.8 }}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`}
                        allowFullScreen
                        loading="lazy"
                      ></iframe>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #334155", paddingTop: "8px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#3b82f6" }}>
                        <Tag size={14} /> {item.category?.name || "Umum"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} /> {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                  {/* Catatan / Feedback dari Admin */}
{item.feedback && (
  <div style={{ 
    marginTop: "10px", 
    padding: "8px 12px", 
    backgroundColor: "#0f172a", 
    borderLeft: `3px solid ${statusInfo.bg}`, 
    borderRadius: "4px",
    fontSize: "0.8rem",
    color: "#e2e8f0"
  }}>
    <strong style={{ display: "block", marginBottom: "2px", color: statusInfo.bg }}>
      Catatan Admin:
    </strong>
    {item.feedback}
  </div>
)}
                  

                  {/* Tombol Vote */}
                  <button
                    onClick={() => handleVote(item.id, isOwnData)}
                    disabled={isOwnData}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "8px", 
                      backgroundColor: isOwnData ? "#334155" : (hasVoted ? "#fee2e2" : "#3b82f6"),
                      color: isOwnData ? "#94a3b8" : (hasVoted ? "#ef4444" : "#fff"),
                      border: "none",
                      borderRadius: "6px",
                      cursor: isOwnData ? "not-allowed" : "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      if (!isOwnData && !hasVoted) e.target.style.backgroundColor = "#2563eb";
                    }}
                    onMouseOut={(e) => {
                      if (!isOwnData && !hasVoted) e.target.style.backgroundColor = "#3b82f6";
                    }}
                  >
                    
                    <Flame size={16} fill={hasVoted ? "#ef4444" : "none"} color={isOwnData ? "#94a3b8" : (hasVoted ? "#ef4444" : "#fca5a5")} />
                    {isOwnData ? "Laporan Sendiri" : (hasVoted ? "Sudah Didukung" : "Dukung Laporan")} ({item.votes_count || 0})
                  </button>

                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#94a3b8", backgroundColor: "#1e293b", borderRadius: "10px" }}>
            Tidak ada laporan yang sesuai dengan filter.
          </div>
        )}
      </div>
    </div>
  );
}