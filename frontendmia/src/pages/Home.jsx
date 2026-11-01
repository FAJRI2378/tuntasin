import React, { useState, useEffect } from "react";
import api from "../js/api";
import { Flame, Tag, Clock, ChevronLeft, ChevronRight, FileText, Search, Share2, X, MessageSquare } from "lucide-react";
import LocationModalButton from "../components/MapButton";

// Seluruh gaya layout & responsif dipusatkan di sini (tanpa hack selector atribut)
const responsiveCss = `
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

  .hm-wrap {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    color: #fff;
    box-sizing: border-box;
    width: 100%;
  }

  /* Header */
  .hm-header {
    margin-bottom: 20px;
    border-bottom: 1px solid #334155;
    padding-bottom: 15px;
  }
  .hm-title { font-size: 1.8rem; font-weight: bold; margin: 0 0 10px 0; }
  .hm-subtitle { color: #94a3b8; margin: 0; font-size: 0.95rem; }

  /* Filter */
  .hm-filter {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
    background-color: #1e293b;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #334155;
    box-sizing: border-box;
  }
  .hm-filter-top {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }
  .hm-search { position: relative; flex: 1 1 260px; min-width: 0; }
  .hm-search input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px 8px 36px;
    border-radius: 6px;
    border: 1px solid #334155;
    background-color: #0f172a;
    color: #fff;
    outline: none;
    font-size: 0.9rem;
  }
  .hm-sort { display: flex; align-items: center; gap: 10px; }
  .hm-sort select {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #334155;
    background-color: #0f172a;
    color: #fff;
    outline: none;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .hm-filter-bottom {
    display: flex;
    align-items: center;
    gap: 10px 15px;
    flex-wrap: wrap;
    border-top: 1px solid #334155;
    padding-top: 12px;
  }
  .hm-total { margin-left: auto; font-size: 0.85rem; color: #94a3b8; }

  /* Grid kartu: min() mencegah overflow di layar < 300px */
  .hm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
    gap: 20px;
    align-items: stretch;
  }
  .hm-grid > * { min-width: 0; }

  .hm-card {
    background-color: #1e293b;
    border-radius: 10px;
    border: 1px solid #334155;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
  }
  .hm-card--top { border: 2px solid #ef4444; }
  .hm-card-body { padding: 15px; flex: 1; display: flex; flex-direction: column; }
  .hm-card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }
  .hm-card-title { font-size: 1.1rem; margin: 0; color: #f8fafc; line-height: 1.3; min-width: 0; overflow-wrap: anywhere; }
  .hm-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px 12px;
    font-size: 0.8rem;
    color: #94a3b8;
    margin-bottom: 12px;
    border-bottom: 1px solid #334155;
    padding-bottom: 8px;
  }
  .hm-feedback-text { overflow-wrap: anywhere; }

  .hm-badges {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;
    z-index: 2;
    max-width: calc(100% - 20px);
  }

  /* Galeri */
  .hm-gallery {
    height: 160px;
    background-color: #0f172a;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .hm-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0,0,0,0.6);
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
  }

  /* Lightbox */
  .hm-lightbox {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 56px 15px 15px;
    box-sizing: border-box;
  }
  .hm-lightbox-close {
    position: fixed;
    top: 12px;
    right: 15px;
    background-color: transparent;
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9rem;
    z-index: 10000;
  }
  .hm-lightbox img {
    max-width: 100%;
    max-height: calc(100dvh - 90px);
    border-radius: 8px;
    object-fit: contain;
    border: 1px solid #334155;
  }

  /* ---------- Tablet / HP (<= 768px) ---------- */
  @media screen and (max-width: 768px) {
    .hm-wrap { padding: 12px; }
    .hm-title { font-size: 1.4rem; }
    .hm-subtitle { font-size: 0.85rem; }
    .hm-sort { width: 100%; }
    .hm-sort select { flex: 1; }
    .hm-grid { grid-template-columns: 1fr; gap: 15px; }
    .hm-nav-btn { width: 32px; height: 32px; } /* target sentuh lebih besar */
  }

  /* ---------- HP kecil (<= 480px) ---------- */
  @media screen and (max-width: 480px) {
    .hm-filter { padding: 12px; }
    .hm-total { margin-left: 0; width: 100%; }
    .hm-card-body { padding: 12px; }
    .hm-gallery { height: 180px; }
  }
`;

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
    setSelectedStatuses((prev) =>
      prev.includes(statusValue) ? prev.filter((s) => s !== statusValue) : [...prev, statusValue]
    );
  };

  // --- FILTER, PENCARIAN & SORTING DATA ---
  const filteredSubmissions = submissions
    .filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.label?.toLowerCase().includes(searchLower) ||
        item.location?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "most_voted") return (b.votes_count || 0) - (a.votes_count || 0);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // --- USER SAAT INI (dihitung sekali, bukan di setiap kartu) ---
  let parsedUser = {};
  try {
    parsedUser = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    parsedUser = {};
  }
  const currentUserId = parsedUser.id || parsedUser.user?.id;

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
    <div className="hm-wrap">
      <style>{responsiveCss}</style>

      {/* --- HEADER --- */}
      <div className="hm-header">
        <h1 className="hm-title">Laporan Terbaru & Paling Mendesak</h1>
        <p className="hm-subtitle">
          Daftar laporan infrastruktur dari masyarakat. Berikan vote agar laporan cepat ditindaklanjuti.
        </p>
      </div>

      {/* --- FILTER & PENCARIAN --- */}
      <div className="hm-filter">
        <div className="hm-filter-top">
          <div className="hm-search">
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan judul, lokasi, atau isi laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hm-sort">
            <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Urutkan:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="most_voted">Vote Paling Banyak</option>
            </select>
          </div>
        </div>

        <div className="hm-filter-bottom">
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
          <div className="hm-total">Total Ditampilkan: {filteredSubmissions.length}</div>
        </div>
      </div>

      {/* --- GRID KARTU LAPORAN --- */}
      <div className="hm-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => <div key={idx} className="skeleton-card"></div>)
        ) : filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((item, index) => {
            const statusInfo = getStatusBadge(item.status);

            const isOwnData = item.user_id == currentUserId || item.user?.id == currentUserId;
            const hasVoted = item.has_voted || false;

            const images = item.images || [];
            const currentImgIdx = activeImageIndices[item.id] || 0;
            const isTop = index === 0 && sortBy === "most_voted";

            return (
              <div key={item.id} className={`hm-card${isTop ? " hm-card--top" : ""}`}>
                {/* Badge Rank 1 & Status */}
                <div className="hm-badges">
                  {isTop && (
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
                  onClick={() => images.length > 0 && setModalImage(`https://tuntasin.epistura.web.id/storage/${images[currentImgIdx].url}`)}
                  style={{ height: "160px", backgroundColor: "#0f172a", position: "relative", overflow: "hidden", cursor: images.length > 0 ? "zoom-in" : "default", flexShrink: 0 }}
                  title={images.length > 0 ? "Klik untuk memperbesar foto" : ""}
                >
                  {images.length > 0 ? (
                    <>
                      <img
                        src={`https://tuntasin.epistura.web.id/storage/${images[currentImgIdx].url}`}
                        alt={`Lampiran ${currentImgIdx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />

                      {images.length > 1 && (
                        <>
                          <button
                            className="hm-nav-btn"
                            style={{ left: "6px" }}
                            aria-label="Foto sebelumnya"
                            onClick={(e) => handlePrevImage(item.id, images.length, e)}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            className="hm-nav-btn"
                            style={{ right: "6px" }}
                            aria-label="Foto berikutnya"
                            onClick={(e) => handleNextImage(item.id, images.length, e)}
                          >
                            <ChevronRight size={16} />
                          </button>

                          <div style={{ position: "absolute", bottom: "6px", right: "6px", backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem" }}>
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
                <div className="hm-card-body">
                  {/* Judul & Tombol Share */}
                  <div className="hm-card-head">
                    <h3 className="hm-card-title">{item.label}</h3>
                    <button
                      onClick={() => handleShare(item)}
                      title="Bagikan Laporan"
                      aria-label="Bagikan laporan"
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px", flexShrink: 0 }}
                    >
                      <Share2 size={16} />
                    </button>
                  </div>

                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.5", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.description}
                  </p>

                  {/* Peta Lokasi */}
                  <LocationModalButton data={item} />

                  {/* Kategori & Tanggal */}
                  <div className="hm-card-meta">
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#3b82f6" }}>
                      <Tag size={14} /> {item.category?.name || "Umum"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  {/* --- FEEDBACK & PDF --- */}
                  <div
                    style={{
                      marginTop: "auto",
                      marginBottom: "12px",
                      padding: "10px",
                      backgroundColor: "#0f172a",
                      borderLeft: `3px solid ${item.feedback ? statusInfo.bg : "#64748b"}`,
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      color: "#e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", color: item.feedback ? statusInfo.bg : "#94a3b8", fontWeight: "bold" }}>
                      <MessageSquare size={14} /> Catatan Admin:
                    </div>

                    <div className="hm-feedback-text" style={{ color: item.feedback ? "#e2e8f0" : "#94a3b8", fontStyle: item.feedback ? "normal" : "italic" }}>
                      {item.feedback ? item.feedback : "Belum ada feedback"}
                    </div>

                    {item.pdf_attachment && (
                      <a
                        href={`https://tuntasin.epistura.web.id/storage/${item.pdf_attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: "#2563eb", color: "#fff", borderRadius: "4px", textDecoration: "none", fontSize: "0.75rem", fontWeight: "bold" }}
                      >
                        <FileText size={12} /> Unduh Dokumen Proyek (PDF)
                      </a>
                    )}
                  </div>

                  {/* Tombol Vote */}
                  <button
                    onClick={() => handleVote(item.id, isOwnData)}
                    disabled={isOwnData}
                    style={{
                      width: "100%",
                      padding: "9px",
                      backgroundColor: isOwnData ? "#334155" : hasVoted ? "#fee2e2" : "#3b82f6",
                      color: isOwnData ? "#94a3b8" : hasVoted ? "#ef4444" : "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: isOwnData ? "not-allowed" : "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s",
                    }}
                  >
                    <Flame size={16} fill={hasVoted ? "#ef4444" : "none"} color={isOwnData ? "#94a3b8" : hasVoted ? "#ef4444" : "#fca5a5"} />
                    {isOwnData ? "Laporan Sendiri" : hasVoted ? "Sudah Didukung" : "Dukung Laporan"} ({item.votes_count || 0})
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

      {/* --- LIGHTBOX FOTO --- */}
      {modalImage && (
        <div className="hm-lightbox" onClick={() => setModalImage(null)}>
          <button className="hm-lightbox-close" onClick={() => setModalImage(null)}>
            <X size={24} /> Tutup
          </button>
          <img src={modalImage} alt="Pratinjau Besar" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}