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
import { useSubmission } from "../contexts/SubmissionContext";

export default function Home() {
  const {submission, setSubmission} = useSubmission()
  const [loading, setLoading] = useState(true);

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
      setSubmission(response.data.data || []);
      console.log(response.data.data)
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
  const filteredSubmissions = submission
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

  let parsedUser = {};
  try {
    parsedUser = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    parsedUser = {};
  }
  const currentUserId = parsedUser.id || parsedUser.user?.id;
  
  const isAdmin = parsedUser.role === "admin" || parsedUser.user?.role === "admin" || parsedUser.is_admin === true;

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#f59e0b" },
    { value: "process", label: "Diproses", color: "#3b82f6" },
    { value: "completed", label: "Selesai", color: "#10b981" },
  ];

  return (
    <div className={styles.hmWrap}>
      {/* --- HEADER --- */}
      <div className={styles.hmHeader}>
        <h1 className={styles.hmTitle}>Daftar Laporan</h1>
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
              <SubmissionCard
                key={item.id}
                item={item}
                index={index}
                userId={currentUserId}
                isAdmin={isAdmin} // <-- Kirim prop isAdmin ke komponen
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