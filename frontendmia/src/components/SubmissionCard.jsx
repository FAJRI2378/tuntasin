import { useState } from "react";
import styles from "../css/components/SubmissionCard.module.css";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Share2,
  Tag,
} from "lucide-react";
import Swal from "sweetalert2";
import LocationModalButton from "./MapButton";
import api from "../js/api";

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

export default function SubmissionCard({
  item,
  index,
  userId,
  sortBy,
  activeImageIndices,
  setActiveImageIndices,
  setModalImage,
}) {
  const statusInfo = getStatusBadge(item.status);

  const isOwnData = item.user_id == userId || item.user?.id == userId;
  const hasVoted = item.has_voted || false;

  const images = item.images || [];
  const currentImgIdx = activeImageIndices[item.id] || 0;
  const isTop = index === 0 && sortBy === "most_voted";

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
      const response = await api.post(`submissions/${submissionId}/vote`);
      
      // Terima status 200 (batal vote) atau 201 (berhasil vote)
      if (response.status === 200 || response.status === 201) {
        // Beritahu komponen Home untuk memuat ulang data submission
        window.dispatchEvent(new Event("submissionUpdated"));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        Swal.fire({
          title: "Login dibutuhkan!",
          icon: "error",
          text: "Silakan login terlebih dahulu untuk memberikan dukungan (vote)!",
        });
      } else {
        Swal.fire({
          title: "Error!",
          icon: "error",
          text: "Gagal memproses vote. Terjadi kesalahan server.",
        });
      }
    }
  }

  // --- FUNGSI BAGIKAN / SHARE LINK ---
  const handleShare = (item) => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      Swal.fire({
        title: "Berhasil!",
        icon: "success",
        text: `Tautan untuk laporan "${item.label}" berhasil disalin ke clipboard!`,
      });
    } else {
      Swal.fire({
        title: "Gagal!",
        icon: "error",
        text: "Gagal menyalin tautan.",
      });
    }
  };

  return (
    <div key={item.id} className={styles[`hmCard${isTop ? " hmCardTop" : ""}`]}>
      {/* Badge Rank 1 & Status */}
      <div className={styles.hmBadges}>
        {isTop && (
          <div
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "0.7rem",
              fontWeight: "bold",
            }}
          >
            🔥 Prioritas
          </div>
        )}
        <div
          style={{
            backgroundColor: statusInfo.bg,
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "0.7rem",
            fontWeight: "bold",
          }}
        >
          {statusInfo.label}
        </div>
      </div>

      {/* --- BAGIAN GALERI FOTO --- */}
      <div
        onClick={() =>
          images.length > 0 &&
          setModalImage(
            `https://tuntasin.epistura.web.id/storage/${images[currentImgIdx].url}`,
          )
        }
        style={{
          height: "160px",
          backgroundColor: "#0f172a",
          position: "relative",
          overflow: "hidden",
          cursor: images.length > 0 ? "zoom-in" : "default",
          flexShrink: 0,
        }}
        title={images.length > 0 ? "Klik untuk memperbesar foto" : ""}
      >
        {images.length > 0 ? (
          <>
            <img
              src={`https://tuntasin.epistura.web.id/storage/${images[currentImgIdx].url}`}
              alt={`Lampiran ${currentImgIdx + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  className={styles.hmNavBtn}
                  style={{ left: "6px" }}
                  aria-label="Foto sebelumnya"
                  onClick={(e) => handlePrevImage(item.id, images.length, e)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className={styles.hmNavBtn}
                  style={{ right: "6px" }}
                  aria-label="Foto berikutnya"
                  onClick={(e) => handleNextImage(item.id, images.length, e)}
                >
                  <ChevronRight size={16} />
                </button>

                <div
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "6px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.65rem",
                  }}
                >
                  {currentImgIdx + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: "0.85rem",
            }}
          >
            Tidak ada foto
          </div>
        )}
      </div>

      {/* --- KONTEN KARTU --- */}
      <div className={styles.hmCardBody}>
        {/* Judul & Tombol Share */}
        <div className={styles.hmCardHead}>
          <h3 className={styles.hmCardTitle}>{item.label}</h3>
          <button
            onClick={() => handleShare(item)}
            title="Bagikan Laporan"
            aria-label="Bagikan laporan"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "2px",
              flexShrink: 0,
            }}
          >
            <Share2 size={16} />
          </button>
        </div>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.85rem",
            lineHeight: "1.5",
            marginBottom: "12px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.description}
        </p>

        {/* Peta Lokasi */}
        <LocationModalButton data={item} />

        {/* Kategori & Tanggal */}
        <div className={styles.hmCardMeta}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#3b82f6",
            }}
          >
            <Tag size={14} /> {item.category?.name || "Umum"}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Clock size={12} />{" "}
            {new Date(item.created_at).toLocaleDateString("id-ID")}
          </span>
        </div>

        {/* --- FEEDBACK & PDF --- */}
        {/* <div
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "4px",
                        color: item.feedback ? statusInfo.bg : "#94a3b8",
                        fontWeight: "bold",
                      }}
                    >
                      <MessageSquare size={14} /> Catatan Admin:
                    </div>

                    <div
                      className={styles.hmFeedbackText}
                      style={{
                        color: item.feedback ? "#e2e8f0" : "#94a3b8",
                        fontStyle: item.feedback ? "normal" : "italic",
                      }}
                    >
                      {item.feedback ? item.feedback : "Belum ada feedback"}
                    </div>

                    {item.pdf_attachment && (
                      <a
                        href={`https://tuntasin.epistura.web.id/storage/${item.pdf_attachment}`}
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
                          fontWeight: "bold",
                        }}
                      >
                        <FileText size={12} /> Unduh Dokumen Proyek (PDF)
                      </a>
                    )}
                  </div> */}

        {/* Tombol Vote */}
        <button
          onClick={() => handleVote(item.id, isOwnData)}
          disabled={isOwnData}
          style={{
            width: "100%",
            padding: "9px",
            backgroundColor: isOwnData
              ? "#334155"
              : hasVoted
                ? "#fee2e2"
                : "#3b82f6",
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
          <Flame
            size={16}
            fill={hasVoted ? "#ef4444" : "none"}
            color={isOwnData ? "#94a3b8" : hasVoted ? "#ef4444" : "#fca5a5"}
          />
          {isOwnData
            ? "Laporan Sendiri"
            : hasVoted
              ? "Sudah Didukung"
              : "Dukung Laporan"}{" "}
          ({item.votes_count || 0})
        </button>
      </div>
    </div>
  );
}
