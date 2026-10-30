import React, { useState, useEffect } from "react";
import api from "../js/api";
import { Flame, MapPin, Tag, Clock, ChevronLeft, ChevronRight, FileText, Search, Share2, X, ZoomIn, MessageSquare } from "lucide-react";

export default function Home() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FILTER, SORTING & SEARCH ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(["pending", "process", "completed"]); 
  const [sortBy, setSortBy] = useState("latest"); 

  // --- STATE UNTUK GALERI FOTO & MODAL ZOOM ---
  const [activeImageIndices, setActiveImageIndices] = useState({});
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    fetchSubmissions();

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

  // --- FUNGSI NAVIGASI FOTO GALERI ---
  const handlePrevImage = (id, totalImages, e) => {
    e.stopPropagation();
    setActiveImageIndices((prev) => {
      const currentIndex = prev[id] || 0;
      const newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
      return { ...prev, [id]: newIndex };
    });
  };

  const handleNextImage = (id, totalImages, e) => {
    e.stopPropagation();
    setActiveImageIndices((prev) => {
      const currentIndex = prev[id] || 0;
      const newIndex = currentIndex === totalImages - 1 ? 0 : currentIndex + 1;
      return { ...prev, [id]: newIndex };
    });
  };

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

  // --- FUNGSI BAGIKAN / SHARE LINK ---
  const handleShare = (item) => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert(`Tautan untuk laporan "${item.label}" berhasil disalin ke clipboard!`);
    } else {
      alert("Gagal menyalin tautan.");
    }
  };

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

  // --- FILTER, PENCARIAN & SORTING DATA ---
  const filteredSubmissions = submissions
    .filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        item.label?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "most_voted") return (b.votes_count || 0) - (a.votes_count || 0);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at); 
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
      
      <style>
        {`
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .skeleton-card {
            background-color: #1e293b;
            border-radius: 12px;
            height: 420px;
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

      {/* --- FILTER & PENCARIAN --- */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px", backgroundColor: "#1e293b", padding: "15px", borderRadius: "8px", border: "1px solid #334155" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "15px" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan judul, lokasi, atau isi laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 36px", borderRadius: "6px",
                border: "1px solid #334155", backgroundColor: "#0f172a", color: "#fff", outline: "none", fontSize: "0.9rem"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "8px 12px", borderRadius: "6px", border: "1px solid #334155",
                backgroundColor: "#0f172a", color: "#fff", outline: "none", cursor: "pointer", fontSize: "0.9rem"
              }}
            >
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="most_voted">Vote Paling Banyak</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap", borderTop: "1px solid #334155", paddingTop: "12px" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Filter Status:</span>
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
          <div style={{ marginLeft: "auto", fontSize: "0.85rem", color: "#94a3b8" }}>
            Total Ditampilkan: {filteredSubmissions.length}
          </div>
        </div>
      </div>

      {/* --- GRID KARTU LAPORAN (Flexbox agar tinggi kartu seragam & rapi tanpa ruang kosong) --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", alignItems: "stretch" }}>
        
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="skeleton-card"></div>
          ))
        ) : filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((item, index) => {
            const statusInfo = getStatusBadge(item.status);
            
            const rawUser = localStorage.getItem("user");
            const parsedUser = rawUser ? JSON.parse(rawUser) : {};
            const currentUserId = parsedUser.id || parsedUser.user?.id;

            const isOwnData = item.user_id == currentUserId || item.user?.id == currentUserId;
            const hasVoted = item.has_voted || false; 

            const images = item.images || [];
            const currentImgIdx = activeImageIndices[item.id] || 0;

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
                  height: "100%" // Memastikan kartu mengisi tinggi grid secara penuh tanpa space kosong
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

                {/* --- BAGIAN GALERI FOTO --- */}
                <div 
                  onClick={() => images.length > 0 && setModalImage(`http://localhost:8000/storage/${images[currentImgIdx].url}`)}
                  style={{ height: "160px", backgroundColor: "#0f172a", position: "relative", overflow: "hidden", cursor: images.length > 0 ? "zoom-in" : "default", flexShrink: 0 }}
                  title={images.length > 0 ? "Klik untuk memperbesar foto" : ""}
                >
                  {images.length > 0 ? (
                    <>
                      <img
                        src={`http://localhost:8000/storage/${images[currentImgIdx].url}`}
                        alt={`Lampiran ${currentImgIdx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => handlePrevImage(item.id, images.length, e)}
                            style={{
                              position: "absolute", left: "6px", top: "50%", transform: "translateY(-50%)",
                              backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%",
                              width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3
                            }}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={(e) => handleNextImage(item.id, images.length, e)}
                            style={{
                              position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)",
                              backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%",
                              width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 3
                            }}
                          >
                            <ChevronRight size={16} />
                          </button>

                          <div style={{
                            position: "absolute", bottom: "6px", right: "6px", backgroundColor: "rgba(0,0,0,0.7)",
                            color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem"
                          }}>
                            {currentImgIdx + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "0.85rem" }}>
                      Tidak ada foto
                    </div>
                  )}
                </div>

                {/* --- KONTEN KARTU --- */}
                <div style={{ padding: "15px", flex: 1, display: "flex", flexDirection: "column" }}>
                  
                  {/* Judul & Tombol Share */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc", lineHeight: "1.3" }}>
                      {item.label}
                    </h3>
                    <button
                      onClick={() => handleShare(item)}
                      title="Bagikan Laporan"
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px", flexShrink: 0 }}
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>

                  {/* Peta Lokasi */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", fontSize: "0.8rem", color: "#cbd5e1" }}>
                       <MapPin size={14} color="#ef4444" /> {item.location}
                    </div>
                    <iframe
                      title="Peta Lokasi"
                      width="100%"
                      height="75"
                      frameBorder="0"
                      style={{ border: 0, borderRadius: "6px", opacity: 0.8 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>

                  {/* Kategori & Tanggal di bagian bawah sebelum feedback */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "12px", borderBottom: "1px solid #334155", paddingBottom: "8px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#3b82f6" }}>
                      <Tag size={14} /> {item.category?.name || "Umum"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  {/* --- KOTAK FEEDBACK & PDF (Selalu rapi & konsisten di setiap kartu) --- */}
                  <div style={{ 
                    marginTop: "auto", // Mendorong bagian ini ke bawah agar tombol vote sejajar rata
                    marginBottom: "12px",
                    padding: "10px", 
                    backgroundColor: "#0f172a", 
                    borderLeft: `3px solid ${item.feedback ? statusInfo.bg : "#64748b"}`, 
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    color: "#e2e8f0"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", color: item.feedback ? statusInfo.bg : "#94a3b8", fontWeight: "bold" }}>
                      <MessageSquare size={14} /> Catatan Admin:
                    </div>
                    
                    <div style={{ color: item.feedback ? "#e2e8f0" : "#94a3b8", fontStyle: item.feedback ? "normal" : "italic" }}>
                      {item.feedback ? item.feedback : "Belum ada feedback"}
                    </div>

                    {/* Tombol Download PDF jika ada lampiran */}
                    {item.pdf_attachment && (
                      <a
                        href={`http://localhost:8000/storage/${item.pdf_attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          marginTop: "8px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          borderRadius: "4px",
                          textDecoration: "none",
                          fontSize: "0.75rem",
                          fontWeight: "bold"
                        }}
                      >
                        <FileText size={12} /> Unduh Dokumen Proyek (PDF)
                      </a>
                    )}
                  </div>

                  {/* Tombol Vote (Diposisikan paling bawah secara konsisten) */}
                  <button
                    onClick={() => handleVote(item.id, isOwnData)}
                    disabled={isOwnData}
                    style={{
                      width: "100%",
                      padding: "9px", 
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
            Tidak ada laporan yang sesuai dengan filter atau pencarian.
          </div>
        )}
      </div>

      {/* --- MODAL PRATINJAU FOTO (LIGHTBOX) --- */}
      {modalImage && (
        <div 
          onClick={() => setModalImage(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.85)", display: "flex", justifyContent: "center",
            alignItems: "center", zIndex: 9999, padding: "20px"
          }}
        >
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModalImage(null)}
              style={{
                position: "absolute", top: "-40px", right: "0",
                backgroundColor: "transparent", color: "#fff", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.9rem"
              }}
            >
              <X size={24} /> Tutup
            </button>
            <img
              src={modalImage}
              alt="Pratinjau Besar"
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "8px", objectFit: "contain", border: "1px solid #334155" }}
            />
          </div>
        </div>
      )}

    </div>
  );
}