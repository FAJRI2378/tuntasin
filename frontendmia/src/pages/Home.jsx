import React, { useState, useEffect } from "react";
import api from "../js/api";
import {
  Flame,
  Tag,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Share2,
  X,
  MessageSquare,
} from "lucide-react";
import styles from "../css/pages/Home.module.css";
import LocationModalButton from "../components/MapButton";
import SubmissionCard from "../components/SubmissionCard";

export default function Home() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FILTER, SORTING & SEARCH ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([
    "pending",
    "process",
    "completed",
  ]);
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

  // --- LOGIKA CHECKLIST STATUS ---
  const handleStatusCheckboxChange = (statusValue) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusValue)
        ? prev.filter((s) => s !== statusValue)
        : [...prev, statusValue],
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
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "most_voted")
        return (b.votes_count || 0) - (a.votes_count || 0);
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
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

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#f59e0b" },
    { value: "process", label: "Diproses", color: "#3b82f6" },
    { value: "invalid", label: "Invalid", color: "#ef4444" },
    { value: "completed", label: "Selesai", color: "#10b981" },
  ];

  return (
    <div className={styles.hmWrap}>
      {/* --- HEADER --- */}
      <div className={styles.hmHeader}>
        <h1 className={styles.hmTitle}>Laporan Terbaru Paling Mendesak</h1>
        <p className={styles.hmSubtitle}>
          Daftar laporan infrastruktur dari masyarakat. Berikan vote agar
          laporan cepat ditindaklanjuti.
        </p>
      </div>

      {/* --- FILTER & PENCARIAN --- */}
      <div className={styles.hmFilter}>
        <div className={styles.hmFilterTop}>
          <div className={styles.hmSearch}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                display: "flex",
              }}
            >
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan judul, lokasi, atau isi laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.hmSort}>
            <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
              Urutkan:
            </span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="most_voted">Vote Paling Banyak</option>
            </select>
          </div>
        </div>

        <div className={styles.hmFilterBottom}>
          <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
            Filter Status:
          </span>
          {statusOptions.map((status) => (
            <label
              key={status.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status.value)}
                onChange={() => handleStatusCheckboxChange(status.value)}
                style={{
                  accentColor: status.color,
                  cursor: "pointer",
                  width: "16px",
                  height: "16px",
                }}
              />
              <span style={{ color: status.color }}>{status.label}</span>
            </label>
          ))}
          <div className={styles.hmTotal}>
            Total Ditampilkan {filteredSubmissions.length}
          </div>
        </div>
      </div>

      {/* --- GRID KARTU LAPORAN --- */}
      <div className={styles.hmGrid}>
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonCard}></div>
          ))
        ) : filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((item, index) => {
            return (
              // <div
              //   key={item.id}
              //   className={styles[`hmCard${isTop ? " hmCardTop" : ""}`]}
              // >
              //   {/* Badge Rank 1 & Status */}
              //   <div className={styles.hmBadges}>
              //     {isTop && (
              //       <div
              //         style={{
              //           backgroundColor: "#ef4444",
              //           color: "#fff",
              //           padding: "4px 8px",
              //           borderRadius: "12px",
              //           fontSize: "0.7rem",
              //           fontWeight: "bold",
              //         }}
              //       >
              //         🔥 Prioritas
              //       </div>
              //     )}
              //     <div
              //       style={{
              //         backgroundColor: statusInfo.bg,
              //         color: "#fff",
              //         padding: "4px 8px",
              //         borderRadius: "12px",
              //         fontSize: "0.7rem",
              //         fontWeight: "bold",
              //       }}
              //     >
              //       {statusInfo.label}
              //     </div>
              //   </div>

              //   {/* --- BAGIAN GALERI FOTO --- */}
              //   <div
              //     onClick={() =>
              //       images.length > 0 &&
              //       setModalImage(
              //         `https://tuntasin.epistura.web.id/storage/${images[currentImgIdx].url}`,
              //       )
              //     }
              //     style={{
              //       height: "160px",
              //       backgroundColor: "#0f172a",
              //       position: "relative",
              //       overflow: "hidden",
              //       cursor: images.length > 0 ? "zoom-in" : "default",
              //       flexShrink: 0,
              //     }}
              //     title={images.length > 0 ? "Klik untuk memperbesar foto" : ""}
              //   >
              //     {images.length > 0 ? (
              //       <>
              //         <img
              //           src={`https://tuntasin.epistura.web.id/storage/${images[currentImgIdx].url}`}
              //           alt={`Lampiran ${currentImgIdx + 1}`}
              //           style={{
              //             width: "100%",
              //             height: "100%",
              //             objectFit: "cover",
              //           }}
              //         />

              //         {images.length > 1 && (
              //           <>
              //             <button
              //               className={styles.hmNavBt}
              //               style={{ left: "6px" }}
              //               aria-label="Foto sebelumnya"
              //               onClick={(e) =>
              //                 handlePrevImage(item.id, images.length, e)
              //               }
              //             >
              //               <ChevronLeft size={16} />
              //             </button>
              //             <button
              //               className={styles.hmNavBt}
              //               style={{ right: "6px" }}
              //               aria-label="Foto berikutnya"
              //               onClick={(e) =>
              //                 handleNextImage(item.id, images.length, e)
              //               }
              //             >
              //               <ChevronRight size={16} />
              //             </button>

              //             <div
              //               style={{
              //                 position: "absolute",
              //                 bottom: "6px",
              //                 right: "6px",
              //                 backgroundColor: "rgba(0,0,0,0.7)",
              //                 color: "#fff",
              //                 padding: "2px 6px",
              //                 borderRadius: "4px",
              //                 fontSize: "0.65rem",
              //               }}
              //             >
              //               {currentImgIdx + 1} / {images.length}
              //             </div>
              //           </>
              //         )}
              //       </>
              //     ) : (
              //       <div
              //         style={{
              //           width: "100%",
              //           height: "100%",
              //           display: "flex",
              //           alignItems: "center",
              //           justifyContent: "center",
              //           color: "#64748b",
              //           fontSize: "0.85rem",
              //         }}
              //       >
              //         Tidak ada foto
              //       </div>
              //     )}
              //   </div>

              //   {/* --- KONTEN KARTU --- */}
              //   <div className={styles.hmCardBody}>
              //     {/* Judul & Tombol Share */}
              //     <div className={styles.hmCardHead}>
              //       <h3 className={styles.hmCardTitle}>{item.label}</h3>
              //       <button
              //         onClick={() => handleShare(item)}
              //         title="Bagikan Laporan"
              //         aria-label="Bagikan laporan"
              //         style={{
              //           background: "none",
              //           border: "none",
              //           color: "#94a3b8",
              //           cursor: "pointer",
              //           padding: "2px",
              //           flexShrink: 0,
              //         }}
              //       >
              //         <Share2 size={16} />
              //       </button>
              //     </div>

              //     <p
              //       style={{
              //         color: "#94a3b8",
              //         fontSize: "0.85rem",
              //         lineHeight: "1.5",
              //         marginBottom: "12px",
              //         display: "-webkit-box",
              //         WebkitLineClamp: 2,
              //         WebkitBoxOrient: "vertical",
              //         overflow: "hidden",
              //       }}
              //     >
              //       {item.description}
              //     </p>

              //     {/* Peta Lokasi */}
              //     <LocationModalButton data={item} />

              //     {/* Kategori & Tanggal */}
              //     <div className={styles.hmCardMeta}>
              //       <span
              //         style={{
              //           display: "flex",
              //           alignItems: "center",
              //           gap: "4px",
              //           color: "#3b82f6",
              //         }}
              //       >
              //         <Tag size={14} /> {item.category?.name || "Umum"}
              //       </span>
              //       <span
              //         style={{
              //           display: "flex",
              //           alignItems: "center",
              //           gap: "4px",
              //         }}
              //       >
              //         <Clock size={12} />{" "}
              //         {new Date(item.created_at).toLocaleDateString("id-ID")}
              //       </span>
              //     </div>

              //     {/* --- FEEDBACK & PDF --- */}
              //     {/* <div
              //       style={{
              //         marginTop: "auto",
              //         marginBottom: "12px",
              //         padding: "10px",
              //         backgroundColor: "#0f172a",
              //         borderLeft: `3px solid ${item.feedback ? statusInfo.bg : "#64748b"}`,
              //         borderRadius: "6px",
              //         fontSize: "0.8rem",
              //         color: "#e2e8f0",
              //       }}
              //     >
              //       <div
              //         style={{
              //           display: "flex",
              //           alignItems: "center",
              //           gap: "4px",
              //           marginBottom: "4px",
              //           color: item.feedback ? statusInfo.bg : "#94a3b8",
              //           fontWeight: "bold",
              //         }}
              //       >
              //         <MessageSquare size={14} /> Catatan Admin:
              //       </div>

              //       <div
              //         className={styles.hmFeedbackText}
              //         style={{
              //           color: item.feedback ? "#e2e8f0" : "#94a3b8",
              //           fontStyle: item.feedback ? "normal" : "italic",
              //         }}
              //       >
              //         {item.feedback ? item.feedback : "Belum ada feedback"}
              //       </div>

              //       {item.pdf_attachment && (
              //         <a
              //           href={`https://tuntasin.epistura.web.id/storage/${item.pdf_attachment}`}
              //           target="_blank"
              //           rel="noopener noreferrer"
              //           style={{
              //             marginTop: "8px",
              //             display: "inline-flex",
              //             alignItems: "center",
              //             gap: "4px",
              //             padding: "4px 8px",
              //             backgroundColor: "#2563eb",
              //             color: "#fff",
              //             borderRadius: "4px",
              //             textDecoration: "none",
              //             fontSize: "0.75rem",
              //             fontWeight: "bold",
              //           }}
              //         >
              //           <FileText size={12} /> Unduh Dokumen Proyek (PDF)
              //         </a>
              //       )}
              //     </div> */}

              //     {/* Tombol Vote */}
              //     <button
              //       onClick={() => handleVote(item.id, isOwnData)}
              //       disabled={isOwnData}
              //       style={{
              //         width: "100%",
              //         padding: "9px",
              //         backgroundColor: isOwnData
              //           ? "#334155"
              //           : hasVoted
              //             ? "#fee2e2"
              //             : "#3b82f6",
              //         color: isOwnData
              //           ? "#94a3b8"
              //           : hasVoted
              //             ? "#ef4444"
              //             : "#fff",
              //         border: "none",
              //         borderRadius: "6px",
              //         cursor: isOwnData ? "not-allowed" : "pointer",
              //         fontSize: "0.85rem",
              //         fontWeight: "bold",
              //         display: "flex",
              //         alignItems: "center",
              //         justifyContent: "center",
              //         gap: "6px",
              //         transition: "all 0.2s",
              //       }}
              //     >
              //       <Flame
              //         size={16}
              //         fill={hasVoted ? "#ef4444" : "none"}
              //         color={
              //           isOwnData ? "#94a3b8" : hasVoted ? "#ef4444" : "#fca5a5"
              //         }
              //       />
              //       {isOwnData
              //         ? "Laporan Sendiri"
              //         : hasVoted
              //           ? "Sudah Didukung"
              //           : "Dukung Laporan"}{" "}
              //       ({item.votes_count || 0})
              //     </button>
              //   </div>
              // </div>
              <SubmissionCard
                item={item}
                index={index}
                userId={currentUserId}
                sortBy={sortBy}
                activeImageIndices={activeImageIndices}
                setActiveImageIndices={setActiveImageIndices}
                setModalImage={setModalImage}
              />
            );
          })
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "40px",
              color: "#94a3b8",
              backgroundColor: "#1e293b",
              borderRadius: "10px",
            }}
          >
            Tidak ada laporan yang sesuai dengan filter atau pencarian.
          </div>
        )}
      </div>

      {/* --- LIGHTBOX FOTO --- */}
      {modalImage && (
        <div className={styles.hmLightbox} onClick={() => setModalImage(null)}>
          <button
            className={styles.hmLightboxClose}
            onClick={() => setModalImage(null)}
          >
            <X size={24} /> Tutup
          </button>
          <img
            src={modalImage}
            alt="Pratinjau Besar"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
